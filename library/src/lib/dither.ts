// Ordered (Bayer) dithering for the gradient previews and their PNG / video exports.
// Preview: one SVG filter shared by every card — threshold tile (feImage + feTile) added to the colour,
// then quantised with a discrete transfer. Export: the same maths on canvas pixels, so PNG = preview.
export type DitherStyle = 2 | 4 | 8 | 16
export type Dither = { on: boolean; style: DitherStyle; size: number; levels: number; brightness: number; contrast: number; mono: boolean; monoColor: string; monoOpacity: number }
export const DITHER_DEFAULT: Dither = { on: false, style: 16, size: 2, levels: 3, brightness: 100, contrast: 1, mono: false, monoColor: '#FFFFFF', monoOpacity: 100 }
export const DITHER_STYLES: DitherStyle[] = [2, 4, 8, 16]
export const DITHER_FILTER_ID = 'aero-dither'

/** Bayer index matrix of size n (power of two), values 0 … n²−1 */
const bayerCache = new Map<number, number[][]>()
export function bayer(n: number): number[][] {
  const hit = bayerCache.get(n); if (hit) return hit
  let m = [[0]]
  while (m.length < n) {
    const s = m.length, next = Array.from({ length: s * 2 }, () => new Array(s * 2).fill(0))
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const v = m[y][x] * 4
      next[y][x] = v; next[y][x + s] = v + 2; next[y + s][x] = v + 3; next[y + s][x + s] = v + 1
    }
    m = next
  }
  bayerCache.set(n, m); return m
}
/** threshold in (0, 1) for one matrix cell */
const thr = (m: number[][], x: number, y: number) => (m[y][x] + .5) / (m.length * m.length)

/** the threshold tile as a PNG data URL, drawn at device resolution so the dots stay crisp */
const tileCache = new Map<string, string>()
export function bayerTile(n: DitherStyle, cssCell: number, dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) {
  const cell = Math.max(1, Math.round(cssCell * dpr)), key = `${n}|${cell}`
  const hit = tileCache.get(key); if (hit) return hit
  const c = document.createElement('canvas'); c.width = c.height = n * cell
  const ctx = c.getContext('2d')!, m = bayer(n)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const g = Math.round(thr(m, x, y) * 255); ctx.fillStyle = `rgb(${g},${g},${g})`; ctx.fillRect(x * cell, y * cell, cell, cell) }
  const url = c.toDataURL('image/png'); tileCache.set(key, url); return url
}
const hexRgb = (h: string) => { const n = parseInt(h.replace('#', '').slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255] }

/** primitives of the shared preview filter (rendered once per page inside a hidden <svg>) */
export function ditherFilterMarkup(d: Dither, id = DITHER_FILTER_ID) {
  const L = Math.max(2, Math.round(d.levels)), b = d.brightness / 100, c = d.contrast
  const slope = +(b * c).toFixed(4), icpt = +(.5 * (1 - c)).toFixed(4)
  const T = d.style * d.size, table = Array.from({ length: L }, (_, k) => +(k / (L - 1)).toFixed(4)).join(' ')
  const lin = (ch: string) => `<feFunc${ch} type="linear" slope="${slope}" intercept="${icpt}"/>`
  const disc = (ch: string) => `<feFunc${ch} type="discrete" tableValues="${table}"/>`
  const [r, g, bl] = hexRgb(d.monoColor).map(v => +(v / 255).toFixed(4)), op = +(d.monoOpacity / 100).toFixed(3)
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
    `<feComponentTransfer in="SourceGraphic" result="bc">${lin('R')}${lin('G')}${lin('B')}</feComponentTransfer>` +
    (d.mono ? `<feColorMatrix in="bc" type="saturate" values="0" result="src"/>` : `<feOffset in="bc" dx="0" dy="0" result="src"/>`) +
    `<feImage href="${bayerTile(d.style, d.size)}" x="0" y="0" width="${T}" height="${T}" preserveAspectRatio="none" result="cell"/><feTile in="cell" result="th"/>` +
    `<feComposite in="src" in2="th" operator="arithmetic" k1="0" k2="${+((L - 1) / L).toFixed(5)}" k3="${+(1 / L).toFixed(5)}" k4="0" result="sum"/>` +
    `<feComponentTransfer in="sum" result="q">${disc('R')}${disc('G')}${disc('B')}<feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>` +
    (d.mono ? `<feColorMatrix in="q" type="matrix" values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${bl} ${op} 0 0 0 0" result="mc"/><feFlood flood-color="#000" result="bg"/><feMerge><feMergeNode in="bg"/><feMergeNode in="mc"/></feMerge>` : '') +
    `</filter>`
}

/** same dithering on canvas pixels; `cell` is the Bayer cell in canvas pixels */
export function ditherPixels(img: ImageData, d: Dither, cell: number) {
  const L = Math.max(2, Math.round(d.levels)), b = d.brightness / 100, c = d.contrast, slope = b * c, icpt = .5 * (1 - c)
  const m = bayer(d.style), n = d.style, px = img.data, W = img.width
  const [mr, mg, mb] = hexRgb(d.monoColor), op = d.monoOpacity / 100
  const q = (v: number, t: number) => { const x = Math.min(1, Math.max(0, v * slope + icpt)); return Math.min(L - 1, Math.floor(x * (L - 1) + t)) / (L - 1) }
  const k = Math.max(1, cell)
  for (let i = 0, p = 0; i < px.length; i += 4, p++) {
    const x = p % W, y = (p / W) | 0, t = thr(m, Math.floor(x / k) % n, Math.floor(y / k) % n)
    if (d.mono) {
      const lum = (.2126 * px[i] + .7152 * px[i + 1] + .0722 * px[i + 2]) / 255, a = q(lum, t) * op
      px[i] = mr * a; px[i + 1] = mg * a; px[i + 2] = mb * a
    } else { px[i] = q(px[i] / 255, t) * 255; px[i + 1] = q(px[i + 1] / 255, t) * 255; px[i + 2] = q(px[i + 2] / 255, t) * 255 }
    px[i + 3] = 255
  }
  return img
}
