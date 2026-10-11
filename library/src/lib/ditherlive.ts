// Live dither previews on canvas. A CSS `filter: url(#svg)` over moving or hovered HTML makes Chrome re-run the
// SVG filter on every repaint; while its source is not ready it shows the bare Bayer tile, so the preview
// flickers. The canvas runs the same maths as the PNG / video export instead, one canvas pixel per dither cell.
import { paintGradient } from './gradpng'
import { ditherPixels, type Dither } from './dither'
import { pose, type GradMotion } from './gradmotion'

/** one shared ~30 fps clock for every moving swatch on the page */
const jobs = new Set<(t: number) => void>(); let raf = 0, last = 0
const tick = (t: number) => {
  raf = 0; if (!jobs.size) return
  if (t - last >= 32) { last = t; jobs.forEach(f => f(t)) }
  raf = requestAnimationFrame(tick)
}
export function onFrame(f: (t: number) => void) {
  jobs.add(f); if (!raf) raf = requestAnimationFrame(tick)
  return () => { jobs.delete(f) }
}

export type LiveDither = { css: string; blur: number; tune: string; dither: Dither; motion?: GradMotion; delay?: number }
/** returns draw(now): paints the swatch (cssW × cssH CSS px) into `canvas`, mirroring .grad-fill + its motion */
export function liveDither(canvas: HTMLCanvasElement, o: LiveDither, cssW: number, cssH: number) {
  const S = Math.max(1, Math.round(o.dither.size)), w = Math.max(1, Math.ceil(cssW / S)), h = Math.max(1, Math.ceil(cssH / S))
  const moving = !!o.motion && o.motion.kind !== 'None'
  let fill: HTMLCanvasElement | null = null, FW = 0, FH = 0, ctx: CanvasRenderingContext2D | null = null
  const setup = () => {
    canvas.width = w; canvas.height = h; canvas.style.width = `${w * S}px`; canvas.style.height = `${h * S}px`
    ctx = canvas.getContext('2d', { willReadFrequently: true })!
    // the fill box reaches 2 × blur past every edge, like .grad-fill, then gets blurred and tuned once
    const m = 2 * o.blur / S; FW = Math.ceil(w + 2 * m); FH = Math.ceil(h + 2 * m)
    const raw = document.createElement('canvas'); raw.width = FW; raw.height = FH; paintGradient(raw.getContext('2d')!, o.css, FW, FH)
    const f = `${o.blur ? `blur(${o.blur / S}px) saturate(1.05)` : ''} ${o.tune}`.trim()
    if (f) { fill = document.createElement('canvas'); fill.width = FW; fill.height = FH; const fc = fill.getContext('2d')!; fc.filter = f; fc.drawImage(raw, 0, 0) } else fill = raw
  }
  return (now: number) => {
    if (!fill) setup()
    const c = ctx!, m = o.motion
    const q = moving ? pose(m!.kind, ((now / 1000 + (o.delay ?? 0)) % m!.dur) / m!.dur) : pose('None', 0)
    c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; c.clearRect(0, 0, w, h)
    c.translate(w / 2 + q.x / 100 * FW, h / 2 + q.y / 100 * FH); c.rotate(q.r * Math.PI / 180); c.scale(q.s, q.s)
    if (q.hue) c.filter = `hue-rotate(${q.hue}deg)`
    c.drawImage(fill!, -FW / 2, -FH / 2)
    c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'
    c.putImageData(ditherPixels(c.getImageData(0, 0, w, h), o.dither, 1), 0, 0)
  }
}
