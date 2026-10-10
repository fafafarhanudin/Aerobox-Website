/* Logo colour modes. Every colour in the SVG is rewritten (attributes, inline styles and <style> rules),
   so what you see in the grid is exactly what Copy / Download hand you. */
export type Tone = 'Original' | 'Grey' | 'Black' | 'White' | 'Duotone'
export const TONES: Tone[] = ['Original', 'Grey', 'Black', 'White', 'Duotone']
export const TONE_SWATCH: Record<Tone, string> = {
  Original: 'conic-gradient(from 200deg, #F43F5E, #F59E0B, #22C55E, #2F6BFF, #7A5AF8, #F43F5E)',
  Grey: '#A3A5AD', Black: '#000000', White: '#FFFFFF', Duotone: 'linear-gradient(135deg, #1E3A8A 50%, #93B4FF 50%)',
}
const NAMED: Record<string, string> = { white: '#ffffff', black: '#000000' }
const parse = (c: string): number[] | null => {
  c = NAMED[c.toLowerCase()] ?? c
  if (c[0] === '#') {
    let h = c.slice(1); if (h.length === 3 || h.length === 4) h = h.split('').map(x => x + x).join('')
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
  }
  const m = c.match(/rgba?\(([^)]+)\)/i); return m ? m[1].split(/[ ,]+/).slice(0, 3).map(Number) : null
}
const hex = (r: number[]) => '#' + r.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t)
const lum = ([r, g, b]: number[]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
const DUO = [[30, 58, 138], [147, 180, 255]], GREY = [[94, 97, 107], [196, 198, 204]]
/** colour that paints a shape with no fill of its own (SVG default is black) */
export const toneInk = (t: Tone) => t === 'White' ? '#FFFFFF' : t === 'Grey' ? '#6B6E78' : t === 'Duotone' ? '#1E3A8A' : '#000000'
export const toneAccent = (t: Tone) => t === 'Duotone' ? '#5B7FE0' : toneInk(t)
const map = (t: Tone, c: string) => {
  const rgb = parse(c); if (!rgb) return c
  const L = lum(rgb), light = L > 0.9
  if (t === 'Black') return light ? '#FFFFFF' : '#000000'
  if (t === 'White') return light ? '#16171B' : '#FFFFFF'
  if (light) return c
  return hex(mix(...(t === 'Grey' ? GREY : DUO) as [number[], number[]], Math.min(1, L * 1.4)))
}
const COLOR = /((?:fill|stroke|stop-color|flood-color|color)\s*[=:]\s*["']?\s*)(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|white\b|black\b)/g
export function toneSvg(svg: string, t: Tone) {
  if (t === 'Original') return svg
  let s = svg.replace(COLOR, (_, k, c) => k + map(t, c))
  // shapes without their own fill inherit the root's, so give the root one
  s = s.replace(/<svg\b([^>]*)>/, (m, a) => /\sfill=/.test(a) ? m : `<svg${a} fill="${toneInk(t)}">`)
  return s
}
const cache = new Map<string, Promise<string>>()
export const fetchSvg = (url: string) => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => r.text())); return cache.get(url)! }
