// Renders the CSS gradients we generate (linear / radial / conic layers) onto a canvas → PNG.
type Stop = { c: string; p?: number }
const splitTop = (s: string) => { const out: string[] = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = '' } else cur += ch } if (cur.trim()) out.push(cur.trim()); return out }
const rgba = (hex: string, a = 1) => { const h = hex.replace('#', ''); const n = (i: number) => parseInt(h.slice(i, i + 2), 16); const al = h.length === 8 ? n(6) / 255 : 1; return `rgba(${n(0)},${n(2)},${n(4)},${al * a})` }
function stops(parts: string[]): Stop[] {
  const st = parts.map(p => { const [c, pos] = p.trim().split(/\s+/); return { c, p: pos ? parseFloat(pos) / 100 : undefined } })
  st.forEach((s, i) => { if (s.p === undefined) s.p = st.length === 1 ? 0 : i / (st.length - 1) })
  // CSS "transparent" fades the neighbour colour, never through black
  const src = st.map(s => s.c)
  return st.map((s, i) => ({ p: s.p, c: src[i] === 'transparent' ? rgba(src[i - 1] ?? src[i + 1], 0) : rgba(src[i]) }))
}
const add = (g: CanvasGradient, st: Stop[]) => st.forEach(s => g.addColorStop(Math.min(1, Math.max(0, s.p!)), s.c))
export function paintGradient(ctx: CanvasRenderingContext2D, css: string, W: number, H: number) {
  const layers = splitTop(css).reverse() // last CSS layer is painted first
  for (const layer of layers) {
    const m = layer.match(/^(linear|radial|conic)-gradient\((.*)\)$/s); if (!m) continue
    const args = splitTop(m[2]); const kind = m[1]
    ctx.save()
    if (kind === 'linear') {
      const a = parseFloat(args[0]) * Math.PI / 180; const L = Math.abs(W * Math.sin(a)) + Math.abs(H * Math.cos(a))
      const dx = Math.sin(a) * L / 2, dy = -Math.cos(a) * L / 2
      const g = ctx.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy); add(g, stops(args.slice(1))); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    } else if (kind === 'radial') {
      const [size, at] = args[0].split(' at '); const [sw, sh] = size.trim().split(/\s+/).map(v => parseFloat(v) / 100); const [ax, ay] = at.trim().split(/\s+/).map(v => parseFloat(v) / 100)
      const cx = ax * W, cy = ay * H, rx = sw * W, ry = (sh ?? sw) * H
      ctx.translate(cx, cy); ctx.scale(rx, ry)
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); add(g, stops(args.slice(1))); ctx.fillStyle = g; ctx.fillRect(-cx / rx, -cy / ry, W / rx, H / ry)
    } else {
      const fm = args[0].match(/from\s+([\d.]+)deg\s+at\s+([\d.]+)%\s+([\d.]+)%/)
      const from = fm ? parseFloat(fm[1]) : 0, cx = (fm ? parseFloat(fm[2]) : 50) / 100 * W, cy = (fm ? parseFloat(fm[3]) : 50) / 100 * H
      const g = ctx.createConicGradient((from - 90) * Math.PI / 180, cx, cy); add(g, stops(args.slice(1))); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
    }
    ctx.restore()
  }
}
export async function gradientPng(css: string, { grain = false, dark = false, blur = 0, W = 1600, H = 1200, tune = '', grainAmt = 32 } = {}): Promise<Blob> {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d')!
  paintGradient(ctx, css, W, H)
  if (blur || tune) {
    const t = document.createElement('canvas'); t.width = W; t.height = H; const tc = t.getContext('2d')!
    tc.filter = `${blur ? `blur(${blur * W / 280}px)` : ''} ${tune}`.trim()
    if (blur) tc.drawImage(c, -W * .1, -H * .1, W * 1.2, H * 1.2); else tc.drawImage(c, 0, 0)
    ctx.clearRect(0, 0, W, H); ctx.drawImage(t, 0, 0)
  }
  if (grain) {
    const img = ctx.getImageData(0, 0, W, H), d = img.data, amt = (dark ? 16 : 13) * grainAmt / 32
    for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * amt * 2; d[i] += n; d[i + 1] += n; d[i + 2] += n }
    ctx.putImageData(img, 0, 0)
  }
  return new Promise(r => c.toBlob(b => r(b!), 'image/png'))
}
export const tailwindOf = (css: string) => `bg-[${css.replace(/\s*,\s*/g, ',').replace(/\s+/g, '_')}]`
