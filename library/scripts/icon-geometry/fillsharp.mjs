// Rebuilds two derived fields of every Aerobox icon from its clean source geometry (`parts`):
//   parts → one entry per subpath, classified for the solid styles:
//           'c' = fill (even nesting depth), 'h' = hole (odd depth), 'o' = open stroke; closed parts sorted by depth
//   sharp → the same drawing with straight edges only: tight corners squared, round shapes faceted
//           (a full circle becomes a pentagon, a tiny dot a square)
// Run: node scripts/icon-geometry/fillsharp.mjs (from library/). Safe to re-run on its own output: the drawing stays
// the same (only the order of subpaths inside `sharp` may shift). New icons only need body + parts.
import fs from 'fs'
import { elementSubs, samples, startOf, endOf, dist, polyArea, pathLength, inPoly, distToPoly, bbox, toD, reverseSub, bez, bezD, fmt, parsePath, cutSub } from './geom.mjs'

const HERE = new URL('.', import.meta.url).pathname
const OUT = HERE + '../../src/data/'
const TOL = .45

function load(file, name) {
  const src = fs.readFileSync(OUT + file, 'utf8')
  const head = `export const ${name}: Icon[] = `
  const a = src.indexOf(head); if (a < 0) throw new Error('no ' + name)
  const lineEnd = src.indexOf('\n', a); const stop = lineEnd < 0 ? src.length : lineEnd
  const json = src.slice(a + head.length, stop).trim().replace(/;$/, '')
  return { src, a: a + head.length, stop, data: JSON.parse(json) }
}

/* ---------------- solid-style classification ---------------- */
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
/** does the polygon (path + closing chord) cross itself? */
function crosses(pts) {
  const P = pts.filter((p, i) => i === 0 || dist(p, pts[i - 1]) > 1e-3), n = P.length
  const side = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
  const hit = (a, b, c, d) => { const d1 = side(c, d, a), d2 = side(c, d, b), d3 = side(a, b, c), d4 = side(a, b, d); return ((d1 > 1e-6 && d2 < -1e-6) || (d1 < -1e-6 && d2 > 1e-6)) && ((d3 > 1e-6 && d4 < -1e-6) || (d3 < -1e-6 && d4 > 1e-6)) }
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue
    if (hit(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return true
  }
  return false
}
function closeSub(s) { if (dist(startOf(s), endOf(s)) > 1e-6) s.segs.push({ t: 'L', p: [endOf(s), startOf(s)] }); s.closed = true }
function joinSegs(chain, b, how) {
  if (how === 'end-start') return { ...chain, segs: [...chain.segs, ...b.segs] }
  if (how === 'end-end') return { ...chain, segs: [...chain.segs, ...reverseSub(b).segs] }
  if (how === 'start-end') { const segs = [...b.segs, ...chain.segs]; return { ...chain, start: segs[0].p[0], segs } }
  const rb = reverseSub(b); const segs = [...rb.segs, ...chain.segs]; return { ...chain, start: segs[0].p[0], segs }
}
function classify(ic) {
  const subs = []
  ic.parts.forEach(([, el]) => { const ss = elementSubs(el); ss.forEach(s => { if (s.segs.length) subs.push({ ...s, el: ss.length === 1 ? el : null, geo: false }) }) })
  for (const s of subs) {
    if (s.closed) s.geo = true
    else if (s.segs.length > 1 && dist(startOf(s), endOf(s)) < TOL) { closeSub(s); s.geo = true; s.el = null }
  }
  // open strokes whose ends meet one another and form a loop become one closed outline
  const open = subs.filter(s => !s.closed)
  const used = new Set(), chains = []
  for (const a of open) {
    if (used.has(a)) continue
    let chain = { ...a, segs: [...a.segs] }; const members = [a]; let grown = true
    while (grown) {
      grown = false
      for (const b of open) {
        if (used.has(b) || members.includes(b)) continue
        const e = endOf(chain), s0 = startOf(chain)
        const how = dist(e, startOf(b)) < TOL ? 'end-start' : dist(e, endOf(b)) < TOL ? 'end-end' : dist(s0, endOf(b)) < TOL ? 'start-end' : dist(s0, startOf(b)) < TOL ? 'start-start' : null
        if (how) { chain = joinSegs(chain, b, how); members.push(b); grown = true; if (dist(startOf(chain), endOf(chain)) < TOL) break }
      }
      if (dist(startOf(chain), endOf(chain)) < TOL) break
    }
    if (members.length > 1 && dist(startOf(chain), endOf(chain)) < TOL && pathLength(chain) > 4) {
      members.forEach(m => used.add(m)); closeSub(chain); chain.geo = true; chain.el = null; chain.members = members; chains.push(chain)
    }
  }
  let all = [...subs.filter(s => !used.has(s)), ...chains]
  // a "closed" path that encloses nothing is still a line
  for (const s of all) if (s.closed && Math.abs(polyArea(samples(s))) < 1) { s.closed = false; s.geo = false }
  // fill-only closures (the line drawing stays as it is):
  //   gap  — an outline broken open for a badge or a notch (file-check, bell-plus, calendar-x)
  //   dome — a shape standing on its own baseline (torso, building, hill)
  //   cup  — a shape hanging from its top line (bin under its lid, mug, tray)
  // The chord that closes it must not run through another shape; a straight stroke lying along the
  // chord (ground line, lid) is welcome, anything else crossing it (an upload arrow) keeps it a line.
  const poly = new Map(all.map(o => [o, samples(o)]))
  for (const s of all) {
    if (s.closed) continue
    const L = pathLength(s); if (L < 8) continue
    const a = startOf(s), b = endOf(s), chord = dist(a, b), pts = poly.get(s), bb = bbox(pts)
    const straight = s.segs.some(g => g.t === 'L' && dist(g.p[0], g.p[1]) >= 2)
    const gap = chord < .35 * L && (chord < 4 || straight)
    const level = chord >= 2 && Math.abs(a[1] - b[1]) < .6
    const dome = level && Math.min(a[1], b[1]) >= bb.y1 - .6, cup = level && Math.max(a[1], b[1]) <= bb.y0 + .6
    if (!gap && !dome && !cup) continue
    const area = Math.abs(polyArea(pts)); if (area < 6 || area / (L * L) < .03) continue
    if (crosses(pts)) continue // spirals, clips, chain links: closing them would not make a shape
    const probes = [.15, .27, .39, .5, .61, .73, .85].map(t => lerp(a, b, t))
    const others = all.filter(o => o !== s)
    const closedOthers = others.filter(o => o.closed), openOthers = others.filter(o => !o.closed)
    // the chord tucked fully under another shape (clipboard body under its clip) closes cleanly;
    // a chord along another shape's edge (bag handle on the bag) or half inside one does not
    const under = closedOthers.some(o => probes.every(p => inPoly(p, poly.get(o)) && distToPoly(p, poly.get(o)) > .4))
    if (!under && probes.some(p => closedOthers.some(o => inPoly(p, poly.get(o)) || distToPoly(p, poly.get(o)) < 1.2))) continue
    if (under) { s.fillClose = true; continue }
    const covered = probes.every(p => openOthers.some(o => distToPoly(p, poly.get(o)) < .6))
    const crossing = probes.some(p => openOthers.some(o => distToPoly(p, poly.get(o)) < 1.2))
    const endsTouched = [a, b].some(e => others.some(o => distToPoly(e, poly.get(o)) < .7))
    if (covered || (gap ? !endsTouched : !crossing && !endsTouched)) {
      s.fillClose = true
      // a gap left for a badge: rebuild the missing corner by running both ends on along their tangents
      if (gap && !covered) {
        s.gapBox = bbox([a, b])
        const g0 = s.segs[0], g1 = s.segs.at(-1)
        const t0 = g0.t === 'L' ? [g0.p[1][0] - g0.p[0][0], g0.p[1][1] - g0.p[0][1]] : bezD(g0.p, 0)
        const t1 = g1.t === 'L' ? [g1.p[1][0] - g1.p[0][0], g1.p[1][1] - g1.p[0][1]] : bezD(g1.p, 1)
        const da = [-t0[0], -t0[1]], db = t1, den = da[0] * db[1] - da[1] * db[0]
        if (Math.abs(den) > 1e-6) {
          const t = ((b[0] - a[0]) * db[1] - (b[1] - a[1]) * db[0]) / den
          const X = [a[0] + da[0] * t, a[1] + da[1] * t], la = Math.hypot(...da) * t
          const lb = ((X[0] - b[0]) * db[0] + (X[1] - b[1]) * db[1]) / Math.hypot(...db) // distance run on from b, forwards
          if (t > 0 && la <= 12 && lb > 0 && lb <= 12) { s.ext = X; s.gapBox = bbox([a, b, X]) }
        }
      }
    }
  }
  // nesting depth among everything that is filled
  const filled = all.filter(s => s.closed || s.fillClose).map(s => { const poly = samples(s); if (s.ext) poly.push(s.ext); return { s, poly, area: Math.abs(polyArea(poly)) } })
  for (const A of filled) {
    A.depth = filled.filter(B => B !== A && B.area > A.area * 1.02 && A.poly.filter(p => inPoly(p, B.poly) || distToPoly(p, B.poly) < .15).length >= .9 * A.poly.length).length
  }
  const order = s => all.indexOf(s)
  const closedOut = filled.sort((p, q) => p.depth - q.depth || order(p.s) - order(q.s)).map(A => {
    const s = A.s, el = `<path d="${toD(s)}"${s.ext ? ` data-x="${fmt(s.ext[0])} ${fmt(s.ext[1])}"` : ''}/>` // absolute M/L/C only; data-x = rebuilt corner (fills only)
    return [A.depth % 2 ? 'h' : 'c', el]
  })
  // open strokes, by where they sit against the solid silhouette:
  //   'e' runs along a fill edge (ground line, lid) → painted solid, never cut out
  //   'o' fully inside (cut out of the fill) or fully outside (a plain line)
  //   'b' crosses the outline (a plus/minus badge on a file corner, the slash of an "off" icon, an arrow leaving a box)
  //       → a clean gap ring is cut around it and it is painted solid, so it never half-melts into the shape
  const edgeOf = s => { const sp = poly.get(s); const near = sp.filter(p => filled.some(F => F.s !== s && distToPoly(p, F.poly) < .4)).length; return near >= .5 * sp.length }
  const solidAt = p => { let d = -1; for (const F of filled) if (F.depth > d && inPoly(p, F.poly)) d = F.depth; return d >= 0 && d % 2 === 0 }
  const kindOf = s => {
    if (!filled.length) return 'o'
    if (edgeOf(s)) return 'e'
    let inn = 0, out = 0
    for (const p of poly.get(s)) { if (filled.some(F => distToPoly(p, F.poly) < .35)) continue; solidAt(p) ? inn++ : out++ }
    const n = inn + out; if (!n) return 'e'
    return inn >= .9 * n || out >= .9 * n ? 'o' : 'b'
  }
  const opens = all.filter(s => !s.closed && !s.fillClose).sort((p, q) => order(p) - order(q))
  const kinds = new Map(opens.map(s => [s, kindOf(s)]))
  // a small badge (plus, minus, check, x) crossing the outline gets a clean rectangular notch: 'n'
  const box = s => bbox(poly.get(s)), near = (A, B, m) => A.x0 - m <= B.x1 && B.x0 - m <= A.x1 && A.y0 - m <= B.y1 && B.y0 - m <= A.y1
  const gaps = all.filter(g => g.gapBox).map(g => g.gapBox)
  const inGap = s => gaps.some(G => near(box(s), G, .5))
  for (const s of opens) {
    if (kinds.get(s) !== 'b' && !(['o', 'b'].includes(kinds.get(s)) && inGap(s))) continue
    const members = [s]; let bb = box(s), grown = true
    while (grown) { grown = false; for (const o of opens) { if (members.includes(o) || !['o', 'b'].includes(kinds.get(o))) continue; const ob = box(o); if (near(bb, ob, .8)) { members.push(o); bb = { x0: Math.min(bb.x0, ob.x0), y0: Math.min(bb.y0, ob.y0), x1: Math.max(bb.x1, ob.x1), y1: Math.max(bb.y1, ob.y1) }; grown = true } } }
    if (Math.max(bb.x1 - bb.x0, bb.y1 - bb.y0) <= 7.5) members.forEach(m => kinds.set(m, 'n'))
  }
  const openOut = opens.map(s => [kinds.get(s), `<path d="${toD(s)}"/>`])
  return { parts: [...closedOut, ...openOut], subs: all }
}

/* ---------------- sharp geometry ---------------- */
const DEG = 180 / Math.PI
const angOf = v => Math.atan2(v[1], v[0])
const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a }
function tangent(seg, t) {
  if (seg.t === 'L') return [seg.p[1][0] - seg.p[0][0], seg.p[1][1] - seg.p[0][1]]
  let d = bezD(seg.p, t)
  if (Math.hypot(d[0], d[1]) < 1e-6) { const a = bez(seg.p, Math.max(0, t - .01)), b = bez(seg.p, Math.min(1, t + .01)); d = [b[0] - a[0], b[1] - a[1]] }
  return d
}
function dense(seg, n = 40) { const out = []; for (let j = 0; j <= n; j++) { const t = j / n; out.push({ p: bez(seg.p, t), a: angOf(tangent(seg, t)) }) } return out }
function segTurn(seg) { const d = dense(seg, 24); let tot = 0; for (let j = 1; j < d.length; j++) tot += wrap(d[j].a - d[j - 1].a); return tot }
function segLen(seg) { if (seg.t === 'L') return dist(seg.p[0], seg.p[1]); const d = dense(seg, 24); let L = 0; for (let j = 1; j < d.length; j++) L += dist(d[j].p, d[j - 1].p); return L }
function intersect(p, u, q, v) { const den = u[0] * v[1] - u[1] * v[0]; if (Math.abs(den) < 1e-6) return null; const t = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / den; return [p[0] + u[0] * t, p[1] + u[1] * t] }

function sharpSub(sp) {
  const segs = sp.segs.filter(s => segLen(s) > 1e-4)
  const total = segs.reduce((t, g) => t + segLen(g), 0)
  if (!segs.length || total < .05) return { d: '', dot: startOf(sp) } // a dot stays a round dot
  const info = segs.map(s => {
    const turn = s.t === 'C' ? segTurn(s) : 0
    const curve = s.t === 'C' && Math.abs(turn) > 4 / DEG
    return { s, curve, turn, a0: angOf(tangent(s, 0)), a1: angOf(tangent(s, 1)), len: segLen(s) }
  })
  const cont = (x, y) => x.curve && y.curve && Math.abs(wrap(y.a0 - x.a1)) < 15 / DEG && Math.sign(x.turn) === Math.sign(y.turn)
  if (sp.closed) {
    const k = info.findIndex((cur, i) => !cont(info[(i - 1 + info.length) % info.length], cur))
    if (k < 0) return { d: toD(sp) } // one continuous curve all round: a circle or an oval keeps its shape
    info.push(...info.splice(0, k))
  }
  const items = []
  for (const it of info) {
    const last = items[items.length - 1]
    if (it.curve && last && last.run && cont(last.run.at(-1), it)) last.run.push(it)
    else items.push(it.curve ? { run: [it] } : { line: it })
  }
  const P = q => `${fmt(q[0])} ${fmt(q[1])}`
  const start = info[0].s.p[0]; let d = `M${P(start)}`, cur = start
  const L = q => { if (dist(cur, q) > .02) { d += `L${P(q)}`; cur = q } }
  items.forEach((item, n) => {
    if (item.line) { L(item.line.s.p.at(-1)); return }
    // a rounded corner sits between straight lines: that one is squared whatever its radius (rounded 0)
    const prev = items[(n - 1 + items.length) % items.length], next = items[(n + 1) % items.length]
    const bounded = (sp.closed || n > 0) && !!prev.line || (sp.closed || n < items.length - 1) && !!next.line
    const corner = cornerOf(item.run, bounded)
    if (corner) { corner.forEach(L); return }
    // a real curve (circle arc, heart lobe, wave): keep it exactly as drawn
    for (const it of item.run) { const p = it.s.p; d += `C${P(p[1])} ${P(p[2])} ${P(p[3])}`; cur = p[3] }
  })
  if (sp.closed) d += 'Z'
  return { d }
}
/** a rounded corner (small radius, or ~90° at a medium one) → the sharp corner points; null for real curves */
function cornerOf(run, bounded) {
  const S = []; let phi = 0
  run.forEach((it, r) => { const dd = dense(it.s); dd.forEach((q, j) => { if (r > 0 && j === 0) return; if (S.length) phi += wrap(q.a - S.at(-1).a); S.push({ ...q, phi }) }) })
  const Th = S.at(-1).phi, L = run.reduce((t, it) => t + it.len, 0), R = L / Math.max(1e-6, Math.abs(Th))
  const deg = Math.abs(Th) * DEG
  if (deg > 185) return null // more than a half turn is a circle-like shape: it stays round
  // between straight lines every rounding goes (rounded 0); a free-standing arc only when it is tight
  if (!bounded && !((R <= 3.4 && deg <= 135) || (R <= 6.5 && deg <= 100))) return null
  const cap = bounded ? 6 : 2.2
  const at = target => { let k = S.findIndex(q => Math.abs(q.phi) >= Math.abs(target) - 1e-9); if (k < 0) k = S.length - 1; return S[k] }
  const k = deg <= 100 ? 1 : 2 // a U-turn (pill end) becomes two right-angle corners: a square end
  const tg = Array.from({ length: k + 1 }, (_, j) => at(Th * j / k))
  const out = []
  for (let j = 1; j <= k; j++) {
    const A = tg[j - 1], B = tg[j]
    const X = intersect(A.p, [Math.cos(A.a), Math.sin(A.a)], B.p, [Math.cos(B.a), Math.sin(B.a)])
    if (!X || dist(X, A.p) > cap || dist(X, B.p) > cap) return null
    out.push(X)
  }
  out.push(S.at(-1).p)
  return out
}
function sharpOf(subs, gaps = []) {
  const parts = subs.map(s => sharpSub(s))
  const main = brokenD(parts.map(p => p.d).join(''), gaps)
  const dots = parts.filter(p => p.dot).map(p => `<path d="M${fmt(p.dot[0])} ${fmt(p.dot[1])}h.01" stroke-linecap="round"/>`).join('')
  return (main ? `<path d="${main}"/>` : '') + dots
}

/* ---------------- the Aero break, carried onto every line style ----------------
   The break lives in `body` as real gaps: a line stops, a short dash, then it carries on. Read where those gaps
   sit, then cut the same gaps into the Sharp and Two-tone geometry (Filled stays whole). */
const EL_RE = /<(?:path|circle|ellipse|rect|line|polyline|polygon)\b[^>]*\/>/g
function breaksOf(body) {
  const subs = (body.match(EL_RE) ?? []).flatMap(el => elementSubs(el)).filter(sp => sp.segs.length)
  const dirEnd = sp => { const g = sp.segs.at(-1); const t = tangent(g, 1); const l = Math.hypot(...t) || 1; return [t[0] / l, t[1] / l] }
  const dirStart = sp => { const g = sp.segs[0]; const t = tangent(g, 0); const l = Math.hypot(...t) || 1; return [t[0] / l, t[1] / l] }
  const gaps = []
  for (const A of subs) for (const B of subs) {
    if (A === B) continue
    const e = endOf(A), st = startOf(B), d = dist(e, st)
    if (d < .3 || d > 4.6) continue
    const da = dirEnd(A), db = dirStart(B), v = [(st[0] - e[0]) / d, (st[1] - e[1]) / d]
    if (da[0] * db[0] + da[1] * db[1] < Math.cos(25 / DEG) || da[0] * v[0] + da[1] * v[1] < Math.cos(30 / DEG)) continue
    const c = [(e[0] + st[0]) / 2, (e[1] + st[1]) / 2]
    if (!gaps.some(g => dist(g.c, c) < .2)) gaps.push({ c, len: d })
  }
  return gaps
}
/** cut each gap out of whichever subpath runs through it (only where there is line on both sides) */
function withBreaks(subs, gaps) {
  if (!gaps.length) return subs
  const meas = subs.map(sp => { const pts = []; let acc = 0, prev = startOf(sp); pts.push([prev, 0]); for (const g of sp.segs) { const n = g.t === 'L' ? Math.max(2, Math.ceil(dist(g.p[0], g.p[1]) / .1)) : 48; for (let j = 1; j <= n; j++) { const q = g.t === 'L' ? [g.p[0][0] + (g.p[1][0] - g.p[0][0]) * j / n, g.p[0][1] + (g.p[1][1] - g.p[0][1]) * j / n] : bez(g.p, j / n); acc += dist(prev, q); prev = q; pts.push([q, acc]) } } return { pts, L: acc } })
  const cuts = subs.map(() => [])
  for (const gp of gaps) {
    let best = null
    meas.forEach((m, i) => { for (const [q, l] of m.pts) { const d = dist(q, gp.c); if (d < .45 && (!best || d < best.d)) best = { i, l, d } } })
    if (!best) continue
    const sp = subs[best.i], L = meas[best.i].L, a = best.l - gp.len / 2, b = best.l + gp.len / 2
    if (!sp.closed && (a < .05 || b > L - .05)) continue
    cuts[best.i].push([a, b])
  }
  return subs.flatMap((sp, i) => cuts[i].length ? cutSub(sp, cuts[i]) : [sp])
}
const brokenD = (d, gaps) => withBreaks(parsePath(d).filter(sp => sp.segs.length), gaps).map(toD).join('')

/* ---------------- run ---------------- */
const stats = {}
for (const [file, name] of [['icons.ts', 'ICONS'], ['icons-ui.ts', 'UI_ICONS']]) {
  const L = load(file, name); let filledBefore = 0, filledAfter = 0, errors = 0
  for (const ic of L.data) {
    if (ic.parts.some(p => p[0] === 'c')) filledBefore++
    try {
      const { parts, subs } = classify(ic)
      const gaps = breaksOf(ic.body)
      ic.parts = parts
      ic.sharp = sharpOf(subs, gaps)
      // Two-tone draws `lines` (the parts with the Aero break cut in); Filled and the fills keep `parts`
      const lines = parts.map(([, el]) => `<path d="${brokenD((el.match(/ d="([^"]*)"/) ?? [])[1] ?? '', gaps)}"/>`)
      if (lines.some((l, k) => l.replace(/ data-x="[^"]*"/, '') !== parts[k][1].replace(/ data-x="[^"]*"/, ''))) ic.lines = lines; else delete ic.lines
      stats.gaps = (stats.gaps ?? 0) + gaps.length
      if (parts.some(p => p[0] === 'c')) filledAfter++
    } catch (e) { errors++; if (errors < 5) console.error(name, ic.name, e.message) }
  }
  const out = L.src.slice(0, L.a) + JSON.stringify(L.data) + L.src.slice(L.stop)
  fs.writeFileSync(OUT + file, out)
  stats[name] = { icons: L.data.length, filledBefore, filledAfter, errors, bytes: out.length }
}
console.log(stats)
