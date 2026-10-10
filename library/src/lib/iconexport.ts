// Clean SVG for Copy / Download: no masks, no wrapper groups — one vector per paint, named after the icon,
// so a paste into Figma lands as "message-circle", not "Mask group › Group › Vector".
// Filled and Duotone are computed as real geometry (stroke outlines + boolean ops with Clipper, loaded on demand).
import { iconData, animate, toneSplit, fillEl, badgeBoxes, TWO_TONE_DEFAULT, type Grad, type IconMotion, type IconStyle } from '../ui'

type Pt = { X: number; Y: number }
type Poly = Pt[]
type Sub = { pts: [number, number][]; closed: boolean }
const S = 1000 // Clipper works in integers: 1 icon unit = 1000
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let CL: any = null
const clipper = async () => CL ?? (CL = (await import('clipper-lib')).default)

/* ---------- parts (absolute M/L/C/Z) → polylines ---------- */
function flatten(d: string): Sub[] {
  const tok = d.match(/[MLCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []
  const out: Sub[] = []; let cur: Sub | null = null, i = 0, x = 0, y = 0, cmd = ''
  const num = () => +tok[i++]
  while (i < tok.length) {
    if (/[MLCZ]/i.test(tok[i])) cmd = tok[i++].toUpperCase()
    if (cmd === 'M') { x = num(); y = num(); cur = { pts: [[x, y]], closed: false }; out.push(cur); cmd = 'L' }
    else if (cmd === 'L') { x = num(); y = num(); cur!.pts.push([x, y]) }
    else if (cmd === 'C') {
      const p0 = [x, y], p1 = [num(), num()], p2 = [num(), num()], p3 = [num(), num()]
      const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(p3[0] - p2[0], p3[1] - p2[1])
      const n = Math.max(4, Math.min(64, Math.ceil(len / .2)))
      for (let k = 1; k <= n; k++) {
        const t = k / n, u = 1 - t
        cur!.pts.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]])
      }
      x = p3[0]; y = p3[1]
    } else if (cmd === 'Z') { if (cur) cur.closed = true; cmd = '' }
    else i++
  }
  return out
}
const elD = (el: string) => (el.match(/ d="([^"]*)"/) ?? [])[1] ?? ''
const toPoly = (s: Sub): Poly => s.pts.map(([px, py]) => ({ X: Math.round(px * S), Y: Math.round(py * S) }))

/* ---------- Clipper helpers ---------- */
async function geo() {
  const C = await clipper()
  const run = (type: number, a: Poly[], b: Poly[]): Poly[] => {
    const c = new C.Clipper(); c.AddPaths(a, C.PolyType.ptSubject, true); if (b.length) c.AddPaths(b, C.PolyType.ptClip, true)
    const sol: Poly[] = []; c.Execute(type, sol, C.PolyFillType.pftNonZero, C.PolyFillType.pftNonZero); return sol
  }
  const offset = (subs: Sub[], half: number, mode: 'line' | 'area'): Poly[] => {
    const co = new C.ClipperOffset(2, .02 * S)
    for (const s of subs) {
      const p = toPoly(s)
      if (mode === 'area') co.AddPath(p, C.JoinType.jtRound, C.EndType.etClosedPolygon)
      else co.AddPath(p, C.JoinType.jtRound, s.closed ? C.EndType.etClosedLine : C.EndType.etOpenRound)
    }
    const out: Poly[] = []; co.Execute(out, half * S); return out
  }
  return {
    union: (a: Poly[], b: Poly[] = []) => run(C.ClipType.ctUnion, a, b),
    diff: (a: Poly[], b: Poly[]) => b.length ? run(C.ClipType.ctDifference, a, b) : a,
    xor: (a: Poly[], b: Poly[]) => run(C.ClipType.ctXor, a, b),
    /** stroke outline of the drawn line */
    line: (subs: Sub[], width: number) => offset(subs, width / 2, 'line'),
    /** the closed shape grown by half a stroke = its fill + its outline */
    area: (subs: Sub[], grow: number) => grow > 0 ? offset(subs, grow, 'area') : run(C.ClipType.ctUnion, subs.map(toPoly), []),
  }
}
/** polygons → compact path data, near-collinear points dropped */
function polyD(polys: Poly[]) {
  const simplify = (p: Poly) => {
    const keep = (a: Pt, b: Pt, c: Pt) => Math.abs((b.X - a.X) * (c.Y - a.Y) - (b.Y - a.Y) * (c.X - a.X)) / Math.max(1, Math.hypot(c.X - a.X, c.Y - a.Y)) > .012 * S
    const out: Pt[] = []
    for (const q of p) { while (out.length >= 2 && !keep(out[out.length - 2], out[out.length - 1], q)) out.pop(); out.push(q) }
    return out
  }
  const n = (v: number) => +(v / S).toFixed(2)
  return polys.map(simplify).filter(p => p.length > 2).map(p => 'M' + p.map(q => `${n(q.X)} ${n(q.Y)}`).join('L') + 'Z').join('')
}

/* ---------- styles ---------- */
const merge = (els: string) => (els.match(/<path\b[^>]*\/>/g) ?? []).map(elD).join('')
const lineAttrs = (stroke: number, cap = 'round', join = 'round') => `stroke-width="${stroke}" stroke-linecap="${cap}" stroke-linejoin="${join}"`
const gradDefs = (g: Grad, id: string) => {
  const a = g.angle * Math.PI / 180, sn = Math.sin(a), cs = Math.cos(a), h = 12 * (Math.abs(sn) + Math.abs(cs)), r = (v: number) => +v.toFixed(2)
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${r(12 - sn * h)}" y1="${r(12 + cs * h)}" x2="${r(12 + sn * h)}" y2="${r(12 - cs * h)}">` +
    g.stops.map((c, i) => `<stop offset="${r(i / (g.stops.length - 1))}" stop-color="${c}"/>`).join('') + `</linearGradient></defs>`
}
const slug = (name: string) => name.replace(/^u:/, '')
/** the drawn line (Aero body) as one vector when it is all paths, else one named group */
const bodyEl = (body: string, id: string, paint: string, attrs: string) => {
  const els = body.match(/<(?:path|circle|ellipse|rect|line|polyline|polygon)\b[^>]*\/>/g) ?? []
  return els.every(el => el.startsWith('<path')) ? `<path id="${id}" d="${merge(body)}" stroke="${paint}" ${attrs}/>` : `<g id="${id}" stroke="${paint}" ${attrs}>${body}</g>`
}

export async function cleanIconSvg(name: string, o: { stroke?: number; color?: string; size?: number; variant?: IconStyle; grad?: Grad; color2?: string; motion?: IconMotion }) {
  const ic = iconData(name); if (!ic) return ''
  const s = o.stroke ?? 1.5, size = o.size ?? 24, v = o.variant ?? 'Aero', id = slug(name)
  const gid = `${id}-paint`, paint = o.grad ? `url(#${gid})` : (o.color ?? 'currentColor')
  const parts = ic.parts as [string, string][]
  let body = ''
  if (v === 'Filled' || v === 'Duotone') {
    const G = await geo()
    const subsOf = (els: string[]) => els.flatMap(el => flatten(elD(el)))
    if (v === 'Filled') {
      const closed = parts.filter(p => p[0] === 'c' || p[0] === 'h').map(([k, el]) => [k, fillEl(el)] as [string, string])
      if (!closed.length) body = `<path id="${id}" d="${merge(parts.map(p => p[1]).join(''))}" stroke="${paint}" ${lineAttrs(s)}/>`
      else {
        const gap = Math.max(1, s * .8)
        let solid: Poly[] = []
        for (const [k, el] of closed) {
          const sub = subsOf([el])
          if (k === 'c') solid = G.union(G.diff(solid, G.line(sub.map(x => ({ ...x, closed: true })), s + 2 * gap)), G.area(sub, s / 2))
          else solid = G.diff(solid, G.area(sub, s / 2))
        }
        const open = subsOf(parts.filter(p => p[0] === 'o').map(p => p[1]))
        if (open.length) solid = G.xor(solid, G.union(G.line(open, s))) // inside the fill: cut out; outside: a solid line
        const badge = subsOf(parts.filter(p => p[0] === 'b').map(p => p[1]))
        if (badge.length) solid = G.union(G.diff(solid, G.line(badge, s + 2 * gap)), G.line(badge, s))
        // small corner badges: a rounded notch around the badge, then the badge itself, solid
        const notchEls = parts.filter(p => p[0] === 'n').map(p => p[1])
        if (notchEls.length) {
          const pad = s / 2 + gap, r = pad * .6
          const rects = badgeBoxes(notchEls).map(b => ({ pts: [[b.x0 - pad + r, b.y0 - pad + r], [b.x1 + pad - r, b.y0 - pad + r], [b.x1 + pad - r, b.y1 + pad - r], [b.x0 - pad + r, b.y1 + pad - r]] as [number, number][], closed: true }))
          solid = G.union(G.diff(solid, G.area(rects, r)), G.line(subsOf(notchEls), s))
        }
        const edge = subsOf(parts.filter(p => p[0] === 'e').map(p => p[1]))
        if (edge.length) solid = G.union(solid, G.line(edge, s))
        body = `<path id="${id}" d="${polyD(G.union(solid))}" fill="${paint}" fill-rule="evenodd"/>`
      }
    } else {
      const closed = parts.filter(p => p[0] === 'c' || p[0] === 'h').map(([k, el]) => [k, fillEl(el)] as [string, string])
      const line = bodyEl(ic.body, `${id} line`, paint, lineAttrs(s))
      if (!closed.length) body = bodyEl(ic.body, id, paint, lineAttrs(s))
      else {
        let area: Poly[] = []
        for (const [k, el] of closed) area = k === 'c' ? G.union(area, G.area(subsOf([el]), 0)) : G.diff(area, G.area(subsOf([el]), 0))
        const wash = o.color2 ? `fill="${o.color2}"` : `fill="${o.color ?? 'currentColor'}" fill-opacity=".2"`
        body = `<g id="${id}"><path id="${id} fill" d="${polyD(area)}" ${wash} fill-rule="evenodd"/>${line}</g>`
      }
    }
  } else if (v === 'Two-tone') {
    const { main, accent } = toneSplit(parts, ic.lines)
    const a = `<path id="${id} line 1" d="${merge(main.join(''))}" stroke="${paint}" ${lineAttrs(s)}/>`
    body = accent.length ? `<g id="${id}">${a}<path id="${id} line 2" d="${merge(accent.join(''))}" stroke="${o.color2 ?? TWO_TONE_DEFAULT}" ${lineAttrs(s)}/></g>` : a.replace(`id="${id} line 1"`, `id="${id}"`)
  } else if (v === 'Sharp') {
    const main = (ic.sharp.match(/<path d="[^"]*"\/>/g) ?? []).map(elD).join(''), dots = (ic.sharp.match(/<path d="[^"]*" stroke-linecap="round"\/>/g) ?? []).map(elD).join('')
    const m = `<path id="${id}" d="${main}" stroke="${paint}" ${lineAttrs(s, 'square', 'miter')}/>`
    body = dots ? `<g id="${id}">${m.replace(`id="${id}"`, `id="${id} lines"`)}<path id="${id} dots" d="${dots}" stroke="${paint}" ${lineAttrs(s)}/></g>` : m
  } else {
    // Aero (and anything else): the drawn line, as one vector
    body = bodyEl(ic.body, id, paint, lineAttrs(s))
  }
  const defs = o.grad ? gradDefs(o.grad, gid) : ''
  const inner = o.motion && o.motion.kind !== 'None' ? animate(defs + body, o.motion, `m${id.replace(/\W/g, '')}`) : defs + body
  return `<svg xmlns="http://www.w3.org/2000/svg" data-aero-icon="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">${inner}</svg>`
}
