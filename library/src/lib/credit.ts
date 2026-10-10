// Every SVG/PNG that leaves the library carries an Aerobox Assets credit:
// SVG → a comment, <title>/<desc> and a named wrapper group (shows up as the layer name in Figma/Illustrator);
// PNG → tEXt metadata (Author, Copyright, Source). Nothing is drawn over the artwork itself.
export const CREDIT_URL = 'https://www.aeroboxstudio.com/library'
const esc = (s: string) => s.replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!)
const pretty = (name: string) => name.replace(/\.(svg|png)$/i, '').replace(/[-_]+/g, ' ').trim() || 'Aerobox asset'

export function creditSvg(svg: string, name = 'Aerobox asset'): string {
  const src = svg.trim()
  if (!/^<svg[\s>]/.test(src) || src.includes('data-credit="aerobox-assets"')) return svg
  const open = src.indexOf('>') + 1, close = src.lastIndexOf('</svg>')
  if (open <= 0 || close < open) return svg
  const n = esc(pretty(name))
  return `<!-- ${n} · Aerobox Assets · ${CREDIT_URL} -->\n` +
    src.slice(0, open).replace(/^<svg/, '<svg data-credit="aerobox-assets"') +
    `<title>${n} · Aerobox Assets</title><desc>Free asset by Aerobox Assets — ${CREDIT_URL}</desc>` +
    `<g id="Aerobox Assets · ${n}">${src.slice(open, close)}</g></svg>`
}

const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })()
const crc32 = (b: Uint8Array) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
function tEXt(key: string, val: string) {
  const data = new TextEncoder().encode(`${key}\0${val}`), body = new Uint8Array(4 + data.length)
  body.set([0x74, 0x45, 0x58, 0x74]); body.set(data, 4)
  const out = new Uint8Array(12 + data.length), dv = new DataView(out.buffer)
  dv.setUint32(0, data.length); out.set(body, 4); dv.setUint32(8 + data.length, crc32(body)); return out
}
export async function creditPng(blob: Blob, name = 'Aerobox asset'): Promise<Blob> {
  const buf = new Uint8Array(await blob.arrayBuffer())
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return blob
  const ihdrEnd = 8 + 4 + 4 + new DataView(buf.buffer).getUint32(8) + 4 // signature + IHDR chunk
  const chunks = [tEXt('Title', `${pretty(name)} · Aerobox Assets`), tEXt('Author', 'Aerobox Assets'), tEXt('Copyright', `Free asset by Aerobox Assets — ${CREDIT_URL}`), tEXt('Source', CREDIT_URL)]
  return new Blob([buf.slice(0, ihdrEnd), ...chunks, buf.slice(ihdrEnd)], { type: 'image/png' })
}
