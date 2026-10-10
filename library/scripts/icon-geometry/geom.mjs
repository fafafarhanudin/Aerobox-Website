// Geometry toolkit for the Aerobox icon data: parse SVG elements into subpaths of L/C segments,
// sample them, and answer closure / containment / turning questions.
const r3 = v => Math.round(v * 1000) / 1000
export const fmt = v => { const s = String(r3(v)); return s === '-0' ? '0' : s }
const pt = (x, y) => [x, y]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
const mul = (a, k) => [a[0] * k, a[1] * k]
const len = a => Math.hypot(a[0], a[1])
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

/* ---------- parsing ---------- */
export function parsePath(d) {
  let i = 0; const n = d.length
  const subs = []; let cur = null
  let x = 0, y = 0, sx = 0, sy = 0, cmd = null, lastC = null, lastQ = null
  const skip = () => { while (i < n && /[\s,]/.test(d[i])) i++ }
  const more = () => { skip(); return i < n && /[-+.\d]/.test(d[i]) }
  const num = () => { skip(); const m = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(d.slice(i, i + 40)); if (!m) throw new Error(`num @${i}: ${d.slice(i, i + 20)}`); i += m[0].length; return parseFloat(m[0]) }
  const flag = () => { skip(); const c = d[i]; if (c !== '0' && c !== '1') throw new Error('flag'); i++; return c === '1' }
  const ensure = () => { if (!cur) { cur = { start: pt(x, y), segs: [], closed: false }; subs.push(cur) } }
  const L = (nx, ny) => { ensure(); cur.segs.push({ t: 'L', p: [pt(x, y), pt(nx, ny)] }); x = nx; y = ny }
  const C = (a, b, c) => { ensure(); cur.segs.push({ t: 'C', p: [pt(x, y), a, b, c] }); x = c[0]; y = c[1] }
  while (true) {
    skip(); if (i >= n) break
    if (/[a-zA-Z]/.test(d[i])) { cmd = d[i++] } else if (!cmd) throw new Error('no cmd')
    const rel = cmd === cmd.toLowerCase(); let U = cmd.toUpperCase()
    if (U === 'Z') { if (cur) { if (dist(pt(x, y), cur.start) > 1e-9) L(cur.start[0], cur.start[1]); cur.closed = true; x = cur.start[0]; y = cur.start[1] } cur = null; lastC = lastQ = null; cmd = null; continue }
    do {
      if (U === 'M') {
        const nx = num() + (rel ? x : 0), ny = num() + (rel ? y : 0)
        x = nx; y = ny; sx = x; sy = y; cur = { start: pt(x, y), segs: [], closed: false }; subs.push(cur)
        cmd = rel ? 'l' : 'L'; U = 'L'; lastC = lastQ = null
        continue
      }
      if (U === 'L') { const nx = num() + (rel ? x : 0), ny = num() + (rel ? y : 0); L(nx, ny); lastC = lastQ = null }
      else if (U === 'H') { const nx = num() + (rel ? x : 0); L(nx, y); lastC = lastQ = null }
      else if (U === 'V') { const ny = num() + (rel ? y : 0); L(x, ny); lastC = lastQ = null }
      else if (U === 'C') { const o = rel ? [x, y] : [0, 0]; const a = pt(num() + o[0], num() + o[1]), b = pt(num() + o[0], num() + o[1]), c = pt(num() + o[0], num() + o[1]); C(a, b, c); lastC = b; lastQ = null }
      else if (U === 'S') { const o = rel ? [x, y] : [0, 0]; const a = lastC ? pt(2 * x - lastC[0], 2 * y - lastC[1]) : pt(x, y); const b = pt(num() + o[0], num() + o[1]), c = pt(num() + o[0], num() + o[1]); C(a, b, c); lastC = b; lastQ = null }
      else if (U === 'Q') { const o = rel ? [x, y] : [0, 0]; const q = pt(num() + o[0], num() + o[1]), c = pt(num() + o[0], num() + o[1]); const p0 = pt(x, y); C(add(p0, mul(sub(q, p0), 2 / 3)), add(c, mul(sub(q, c), 2 / 3)), c); lastQ = q; lastC = null }
      else if (U === 'T') { const o = rel ? [x, y] : [0, 0]; const q = lastQ ? pt(2 * x - lastQ[0], 2 * y - lastQ[1]) : pt(x, y); const c = pt(num() + o[0], num() + o[1]); const p0 = pt(x, y); C(add(p0, mul(sub(q, p0), 2 / 3)), add(c, mul(sub(q, c), 2 / 3)), c); lastQ = q; lastC = null }
      else if (U === 'A') {
        const rx = num(), ry = num(), rot = num(), la = flag(), sw = flag(); const nx = num() + (rel ? x : 0), ny = num() + (rel ? y : 0)
        for (const c of arcToCubics(x, y, rx, ry, rot, la, sw, nx, ny)) C(c[0], c[1], c[2])
        x = nx; y = ny; lastC = lastQ = null
      } else throw new Error('cmd ' + cmd)
    } while (more())
  }
  return subs.filter(s => s.segs.length || true)
}
function arcToCubics(x1, y1, rx, ry, phiDeg, fa, fs, x2, y2) {
  if (rx === 0 || ry === 0 || (x1 === x2 && y1 === y2)) return [[pt(x1, y1), pt(x2, y2), pt(x2, y2)]]
  const phi = phiDeg * Math.PI / 180, cp = Math.cos(phi), sp = Math.sin(phi)
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2
  const x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy
  rx = Math.abs(rx); ry = Math.abs(ry)
  const lam = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry); if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam) }
  const sign = fa === fs ? -1 : 1
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p, den = rx * rx * y1p * y1p + ry * ry * x1p * x1p
  const co = sign * Math.sqrt(Math.max(0, num / den))
  const cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx
  const cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2
  const ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a }
  let t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry), dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
  if (!fs && dt > 0) dt -= 2 * Math.PI; else if (fs && dt < 0) dt += 2 * Math.PI
  const segs = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-9)), step = dt / segs, k = 4 / 3 * Math.tan(step / 4)
  const out = []
  const P = t => pt(cx + rx * Math.cos(t) * cp - ry * Math.sin(t) * sp, cy + rx * Math.cos(t) * sp + ry * Math.sin(t) * cp)
  const D = t => pt(-rx * Math.sin(t) * cp - ry * Math.cos(t) * sp, -rx * Math.sin(t) * sp + ry * Math.cos(t) * cp)
  for (let s = 0; s < segs; s++) {
    const a = t1 + s * step, b = a + step
    const pa = P(a), pb = P(b), da = D(a), db = D(b)
    out.push([add(pa, mul(da, k)), sub(pb, mul(db, k)), s === segs - 1 ? pt(x2, y2) : pb])
  }
  return out
}
const attrsOf = el => Object.fromEntries([...el.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]))
const K = 0.5522847498
function ellipseSub(cx, cy, rx, ry) {
  const s = { start: pt(cx + rx, cy), segs: [], closed: true, ellipse: { cx, cy, rx, ry } }
  const P = [pt(cx + rx, cy), pt(cx, cy + ry), pt(cx - rx, cy), pt(cx, cy - ry), pt(cx + rx, cy)]
  const T = [pt(0, ry * K), pt(-rx * K, 0), pt(0, -ry * K), pt(rx * K, 0)]
  for (let q = 0; q < 4; q++) s.segs.push({ t: 'C', p: [P[q], add(P[q], T[q]), sub(P[q + 1], T[(q + 1) % 4]), P[q + 1]] })
  return s
}
export function elementSubs(el) {
  const tag = el.match(/^<(\w+)/)[1], a = attrsOf(el)
  if (tag === 'path') return parsePath(a.d)
  if (tag === 'circle') return [ellipseSub(+a.cx, +a.cy, +a.r, +a.r)]
  if (tag === 'ellipse') return [ellipseSub(+a.cx, +a.cy, +a.rx, +a.ry)]
  if (tag === 'rect') {
    const x = +(a.x || 0), y = +(a.y || 0), w = +a.width, h = +a.height
    let rx = a.rx !== undefined ? +a.rx : a.ry !== undefined ? +a.ry : 0, ry = a.ry !== undefined ? +a.ry : rx
    rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2)
    const d = rx > 0
      ? `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`
      : `M${x} ${y}H${x + w}V${y + h}H${x}Z`
    const s = parsePath(d); s[0].rect = { x, y, w, h }; return s
  }
  if (tag === 'line') return parsePath(`M${a.x1} ${a.y1}L${a.x2} ${a.y2}`)
  if (tag === 'polyline' || tag === 'polygon') return parsePath('M' + a.points + (tag === 'polygon' ? 'Z' : ''))
  throw new Error('tag ' + tag)
}

/* ---------- evaluation ---------- */
export const bez = (p, t) => { const u = 1 - t; return [u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0], u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]] }
export const bezD = (p, t) => { const u = 1 - t; return [3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]), 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1])] }
export function segPoints(s, n = 16) {
  if (s.t === 'L') { const out = []; const k = Math.max(1, Math.ceil(dist(s.p[0], s.p[1]) / .5)); for (let j = 1; j <= k; j++) out.push(add(s.p[0], mul(sub(s.p[1], s.p[0]), j / k))); return out }
  const out = []; for (let j = 1; j <= n; j++) out.push(bez(s.p, j / n)); return out
}
export function samples(sp) { const out = [sp.segs.length ? sp.segs[0].p[0] : sp.start]; for (const s of sp.segs) out.push(...segPoints(s)); return out }
export const endOf = sp => sp.segs.length ? sp.segs[sp.segs.length - 1].p.at(-1) : sp.start
export const startOf = sp => sp.segs.length ? sp.segs[0].p[0] : sp.start
export function polyArea(pts) { let a = 0; for (let k = 0; k < pts.length; k++) { const p = pts[k], q = pts[(k + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1] } return a / 2 }
export function pathLength(sp) { let L = 0; for (const s of sp.segs) { let prev = s.p[0]; for (const q of segPoints(s, 24)) { L += dist(prev, q); prev = q } } return L }
export function inPoly(p, poly) {
  let inside = false
  for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
    const [xi, yi] = poly[a], [xj, yj] = poly[b]
    if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) inside = !inside
  }
  return inside
}
export function distToPoly(p, poly) { let m = Infinity; for (let a = 0; a < poly.length - 1; a++) { const A = poly[a], B = poly[a + 1], AB = sub(B, A), L2 = AB[0] ** 2 + AB[1] ** 2; const t = L2 ? Math.max(0, Math.min(1, ((p[0] - A[0]) * AB[0] + (p[1] - A[1]) * AB[1]) / L2)) : 0; m = Math.min(m, dist(p, add(A, mul(AB, t)))) } return m }
export function bbox(pts) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 } }

/* ---------- serialising ---------- */
export function toD(sp) {
  let d = `M${fmt(startOf(sp)[0])} ${fmt(startOf(sp)[1])}`
  for (const s of sp.segs) d += s.t === 'L' ? `L${fmt(s.p[1][0])} ${fmt(s.p[1][1])}` : `C${s.p.slice(1).map(q => fmt(q[0]) + ' ' + fmt(q[1])).join(' ')}`
  if (sp.closed) d += 'Z'
  return d
}
export function reverseSub(sp) {
  const segs = [...sp.segs].reverse().map(s => s.t === 'L' ? { t: 'L', p: [s.p[1], s.p[0]] } : { t: 'C', p: [s.p[3], s.p[2], s.p[1], s.p[0]] })
  return { ...sp, start: segs.length ? segs[0].p[0] : sp.start, segs }
}

/* ---------- arc-length slicing (the Aero break, cut into real geometry) ---------- */
const segLenOf = s => { if (s.t === 'L') return dist(s.p[0], s.p[1]); let L = 0, prev = s.p[0]; for (let j = 1; j <= 32; j++) { const q = bez(s.p, j / 32); L += dist(prev, q); prev = q } return L }
/** parameter t at arc length l along one segment */
function tAt(s, l) {
  const L = segLenOf(s); if (s.t === 'L') return L ? Math.min(1, Math.max(0, l / L)) : 0
  let acc = 0, prev = s.p[0]
  for (let j = 1; j <= 64; j++) { const q = bez(s.p, j / 64), d = dist(prev, q); if (acc + d >= l) return (j - 1 + (d ? (l - acc) / d : 0)) / 64; acc += d; prev = q }
  return 1
}
/** the part of one segment between parameters t0 and t1 */
function subSeg(s, t0, t1) {
  if (s.t === 'L') { const a = [s.p[0][0] + (s.p[1][0] - s.p[0][0]) * t0, s.p[0][1] + (s.p[1][1] - s.p[0][1]) * t0], b = [s.p[0][0] + (s.p[1][0] - s.p[0][0]) * t1, s.p[0][1] + (s.p[1][1] - s.p[0][1]) * t1]; return { t: 'L', p: [a, b] } }
  const split = (p, t) => { const l = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; const a = l(p[0], p[1]), b = l(p[1], p[2]), c = l(p[2], p[3]), d = l(a, b), e = l(b, c), f = l(d, e); return [[p[0], a, d, f], [f, e, c, p[3]]] }
  let p = s.p
  if (t1 < 1) p = split(p, t1)[0]
  if (t0 > 0) p = split(p, t1 > 0 ? t0 / t1 : 0)[1]
  return { t: 'C', p }
}
export const subLength = sp => sp.segs.reduce((t, s) => t + segLenOf(s), 0)
/** the stretch of a subpath between arc lengths a and b (a < b) */
export function slice(sp, a, b) {
  const out = []; let acc = 0
  for (const s of sp.segs) {
    const L = segLenOf(s), s0 = acc, s1 = acc + L; acc = s1
    if (s1 <= a || s0 >= b || L < 1e-9) continue
    const t0 = a > s0 ? tAt(s, a - s0) : 0, t1 = b < s1 ? tAt(s, b - s0) : 1
    if (t1 - t0 > 1e-6) out.push(subSeg(s, t0, t1))
  }
  return { start: out.length ? out[0].p[0] : sp.start, segs: out, closed: false }
}
/** remove the given arc-length intervals (closed loops wrap) and return the open pieces left over */
export function cutSub(sp, cuts) {
  const L = subLength(sp); if (!cuts.length) return [sp]
  const cs = cuts.map(([a, b]) => [Math.max(sp.closed ? -L : 0, a), Math.min(sp.closed ? 2 * L : L, b)]).sort((x, y) => x[0] - y[0])
  const pieces = []
  if (!sp.closed) {
    let from = 0
    for (const [a, b] of cs) { if (a > from + .05) pieces.push(slice(sp, from, a)); from = Math.max(from, b) }
    if (L > from + .05) pieces.push(slice(sp, from, L))
  } else {
    // on a loop: keep the stretches between consecutive cuts, wrapping past the seam
    const norm = cs.map(([a, b]) => { const s = ((a % L) + L) % L; return [s, s + (b - a)] }).sort((x, y) => x[0] - y[0])
    for (let k = 0; k < norm.length; k++) {
      const from = norm[k][1], to = k + 1 < norm.length ? norm[k + 1][0] : norm[0][0] + L
      if (to - from < .05) continue
      if (to <= L) pieces.push(slice(sp, from, to))
      else if (from >= L) pieces.push(slice(sp, from - L, to - L))
      else { const A = slice(sp, from, L), B = slice(sp, 0, to - L); pieces.push({ start: A.start, segs: [...A.segs, ...B.segs], closed: false }) }
    }
  }
  return pieces.filter(p => p.segs.length && subLength(p) > .05)
}
