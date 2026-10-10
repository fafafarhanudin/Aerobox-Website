// Moving gradients. One pose function drives everything: the CSS keyframes in the previews, the copied CSS
// and the canvas frames of the video export — so what you see is what you download.
import { paintGradient } from './gradpng'
import { ditherPixels, type Dither } from './dither'

export type GradMotionKind = 'None' | 'Drift' | 'Orbit' | 'Breathe' | 'Spin' | 'Hue'
export const GRAD_MOTIONS: GradMotionKind[] = ['None', 'Drift', 'Orbit', 'Breathe', 'Spin', 'Hue']
export type GradMotion = { kind: GradMotionKind; dur: number }
export const GRAD_SPEEDS = [['Slow', 16], ['Normal', 10], ['Fast', 6]] as const
export const GRAD_MOTION_NOTE: Record<GradMotionKind, string> = {
  None: 'Still', Drift: 'Colours wander slowly side to side', Orbit: 'The light circles the frame', Breathe: 'Swells in and out with a slight turn',
  Spin: 'The whole field turns once per loop', Hue: 'Colours cycle around the wheel',
}
type Pose = { s: number; x: number; y: number; r: number; hue: number } // x, y in % of the box
const TAU = Math.PI * 2
export function pose(kind: GradMotionKind, p: number): Pose {
  const a = TAU * p
  switch (kind) {
    case 'Drift': return { s: 1.3, x: 7 * Math.sin(a), y: 2.5 * Math.sin(2 * a), r: 0, hue: 0 }
    case 'Orbit': return { s: 1.4, x: 7 * Math.cos(a), y: 6 * Math.sin(a), r: 0, hue: 0 }
    case 'Breathe': return { s: 1.12 + .14 * (.5 - .5 * Math.cos(a)), x: 0, y: 0, r: 5 * Math.sin(a), hue: 0 }
    case 'Spin': return { s: 2.1, x: 0, y: 0, r: 360 * p, hue: 0 }
    case 'Hue': return { s: 1, x: 0, y: 0, r: 0, hue: 360 * p }
    default: return { s: 1, x: 0, y: 0, r: 0, hue: 0 }
  }
}
const n2 = (v: number) => +v.toFixed(2)
const transformOf = (q: Pose) => `translate(${n2(q.x)}%, ${n2(q.y)}%) rotate(${n2(q.r)}deg) scale(${n2(q.s)})`
/** keyframes sampled from the pose function (linear between 24 samples reads as smooth motion) */
export function keyframes(kind: GradMotionKind, name: string, baseFilter = '') {
  const steps = kind === 'Spin' ? 4 : 24
  const rows = Array.from({ length: steps + 1 }, (_, i) => {
    const q = pose(kind, i / steps)
    const f = kind === 'Hue' ? `filter: ${`${baseFilter} hue-rotate(${n2(q.hue)}deg)`.trim()};` : ''
    return `${n2(i / steps * 100)}% { transform: ${transformOf(q)}; ${f} }`
  })
  return `@keyframes ${name} {\n  ${rows.join('\n  ')}\n}`
}
export const animName = (kind: GradMotionKind) => `aero-${kind.toLowerCase()}`
/** CSS a visitor can paste: the gradient on a pseudo-element so it can move inside a clipped box */
export function motionSnippet(css: string, m: GradMotion, filter = '') {
  const name = animName(m.kind)
  return `.aero-gradient {\n  position: relative;\n  overflow: hidden;\n}\n.aero-gradient::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background: ${css.replace(/\), /g, '),\n    ')};\n` +
    (filter ? `  filter: ${filter};\n` : '') + `  animation: ${name} ${m.dur}s linear infinite;\n}\n${keyframes(m.kind, name, filter)}\n@media (prefers-reduced-motion: reduce) {\n  .aero-gradient::before { animation: none; }\n}`
}

/** record one seamless loop of the moving gradient as a video (WebM, or MP4 where WebM is unavailable) */
export async function gradientVideo(css: string, o: { W: number; H: number; blur: number; tune: string; motion: GradMotion; dither?: Dither; ditherCell?: number; onProgress?: (p: number) => void }): Promise<{ blob: Blob; ext: string }> {
  const { W, H, motion } = o
  const base = document.createElement('canvas'); base.width = W; base.height = H; const bc = base.getContext('2d')!
  paintGradient(bc, css, W, H)
  if (o.blur || o.tune) {
    const t = document.createElement('canvas'); t.width = W; t.height = H; const tc = t.getContext('2d')!
    tc.filter = `${o.blur ? `blur(${o.blur * W / 280}px)` : ''} ${o.tune}`.trim()
    if (o.blur) tc.drawImage(base, -W * .1, -H * .1, W * 1.2, H * 1.2); else tc.drawImage(base, 0, 0)
    bc.clearRect(0, 0, W, H); bc.drawImage(t, 0, 0)
  }
  const out = document.createElement('canvas'); out.width = W; out.height = H; const ctx = out.getContext('2d', { willReadFrequently: !!o.dither?.on })!
  const draw = (p: number) => {
    const q = pose(motion.kind, p)
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.clearRect(0, 0, W, H)
    ctx.translate(W / 2 + q.x / 100 * W, H / 2 + q.y / 100 * H); ctx.rotate(q.r * Math.PI / 180); ctx.scale(q.s, q.s)
    if (q.hue) ctx.filter = `hue-rotate(${q.hue}deg)`
    ctx.drawImage(base, -W / 2, -H / 2)
    if (o.dither?.on) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = 'none'; ctx.putImageData(ditherPixels(ctx.getImageData(0, 0, W, H), o.dither, o.ditherCell ?? 2), 0, 0) }
  }
  draw(0)
  const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4;codecs=avc1', 'video/mp4']
  const mime = types.find(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t))
  if (!mime) throw new Error('Video recording is not supported in this browser')
  const rec = new MediaRecorder(out.captureStream(30), { mimeType: mime, videoBitsPerSecond: 10_000_000 })
  const chunks: Blob[] = []; rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
  const done = new Promise<void>(r => { rec.onstop = () => r() })
  rec.start(250)
  const ms = motion.dur * 1000, t0 = performance.now()
  await new Promise<void>(resolve => {
    const tick = () => {
      const t = performance.now() - t0
      if (t >= ms) { draw(0); resolve(); return }
      draw(t / ms); o.onProgress?.(t / ms); requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await new Promise(r => setTimeout(r, 120)); rec.stop(); await done
  return { blob: new Blob(chunks, { type: mime.split(';')[0] }), ext: mime.includes('mp4') ? 'mp4' : 'webm' }
}
