// Isometric palettes, shared by the library page, the public API, the MCP server and the Figma plugin.
// The templates are drawn in seven blue tones: lit face, left face, accent, right face, deep accent, outline, white.
// Every palette is a 1:1 swap of those seven, so the two-colour palettes give faces one hue and accents another
// (the illustrated look: salmon boxes, teal details, cream paper, a warm dark line).
export const ISO_BASE = ['#E3EAFF', '#B8C8F8', '#4D7CFE', '#98B3FE', '#3C61C6', '#1F2A5A', '#FFFFFF']

export const ISO_PALETTES = {
  Coral: ['#FBD5C7', '#F4A48D', '#4FB3A2', '#EF8B71', '#2E8576', '#2A1A16', '#FFF6EE'],
  Mint: ['#D3F0E9', '#93D5C7', '#F07D5F', '#6FC3B2', '#C4563C', '#12352F', '#FFFFFF'],
  Lilac: ['#E3E2FF', '#B7B3F8', '#F28A6E', '#9F9AF2', '#CF6248', '#221A48', '#FFFFFF'],
  Sand: ['#FBEAD2', '#F1CD9C', '#5B5BD6', '#E9BB7E', '#3D3DA6', '#2B2118', '#FFFBF4'],
  Blue: ISO_BASE,
  Green: ['#DCFCE7', '#A7F3D0', '#22C55E', '#86EFAC', '#15803D', '#14532D', '#FFFFFF'],
  Violet: ['#EDE9FE', '#C4B5FD', '#7C3AED', '#A78BFA', '#5B21B6', '#2E1065', '#FFFFFF'],
  Mono: ['#EEEFF2', '#C9CBD2', '#3A3B42', '#8D909A', '#16171B', '#16171B', '#FFFFFF'],
} as const satisfies Record<string, readonly string[]>

export type IsoPalette = keyof typeof ISO_PALETTES
export const ISO_DEFAULT: IsoPalette = 'Coral'

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
const mix = (a: string, b: string, t: number) =>
  '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase()

/** two custom colours become the same seven tones: tints of the face colour, the accent and its shade, a dark line */
export const isoCustomTones = (face: string, accent: string) =>
  [mix(face, '#FFFFFF', 0.72), mix(face, '#FFFFFF', 0.28), accent, face, mix(accent, '#000000', 0.3), mix(face, '#000000', 0.8), '#FFFFFF']

export const isoRecolor = (svg: string, tones: readonly string[], stroke = 1) => {
  let s = svg
  if (tones !== ISO_BASE) ISO_BASE.forEach((c, i) => { s = s.split(c).join(tones[i]).split(c.toLowerCase()).join(tones[i]) })
  if (stroke !== 1) s = s.replace(/stroke-width="1"/g, `stroke-width="${stroke}"`)
  return s
}

/** the illustrated hard shadow: no blur, full strength, in the outline colour, falling to the lower left */
export const isoSolidShadow = (art: string, id = 'iso-solid') =>
  `<defs><filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feOffset in="SourceAlpha" dx="-7.79" dy="4.5" result="o"/>` +
  `<feFlood flood-color="#1F2A5A"/><feComposite in2="o" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#${id})">${art}</g>`

/** a finished SVG in a palette (or two custom colours), with the default illustrated look unless shadow is off */
export function isoSvg(art: string, { palette = ISO_DEFAULT, face, accent, stroke = 1.5, shadow = true, size = 240 }: { palette?: IsoPalette; face?: string; accent?: string; stroke?: number; shadow?: boolean; size?: number } = {}) {
  const tones = face && accent ? isoCustomTones(face, accent) : ISO_PALETTES[palette] ?? ISO_PALETTES[ISO_DEFAULT]
  const body = shadow ? isoSolidShadow(art) : art
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="${size}" height="${Math.round((size * 200) / 240)}">${isoRecolor(body, tones, stroke)}</svg>`
}
