// Tiny dependency-free confetti / party-popper engine on a single full-screen canvas.
export const COLORS = ['#2F6BFF', '#FF5E62', '#FFB547', '#22C55E', '#A78BFA', '#3FD6E8', '#F472B6', '#FFE16B']
type Shape = 'rect' | 'circle' | 'ribbon' | 'star'
type P = {
  x: number; y: number; vx: number; vy: number; size: number; rot: number; vr: number
  tilt: number; vt: number; color: string; shape: Shape; life: number; decay: number; drag: number; g: number
}
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let parts: P[] = []
let raf = 0
const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ensure() {
  if (canvas) return
  canvas = document.createElement('canvas')
  canvas.className = 'confetti-canvas'
  document.body.appendChild(canvas)
  ctx = canvas.getContext('2d')
  const fit = () => {
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr
    canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  fit(); addEventListener('resize', fit)
}

function spawn(o: { x: number; y: number; angle: number; spread: number; velocity: number; count: number; colors?: string[]; gravity?: number }) {
  const colors = o.colors ?? COLORS
  for (let i = 0; i < o.count; i++) {
    const a = (o.angle + (Math.random() - 0.5) * o.spread) * Math.PI / 180
    const v = o.velocity * (0.55 + Math.random() * 0.75)
    const r = Math.random()
    const shape: Shape = r < 0.46 ? 'rect' : r < 0.7 ? 'circle' : r < 0.9 ? 'ribbon' : 'star'
    parts.push({
      x: o.x, y: o.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      size: 5 + Math.random() * 6, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 14,
      tilt: Math.random() * Math.PI * 2, vt: 0.08 + Math.random() * 0.12,
      color: colors[(Math.random() * colors.length) | 0], shape,
      life: 1, decay: 0.004 + Math.random() * 0.006, drag: 0.982 + Math.random() * 0.01, g: (o.gravity ?? 0.26) * (0.8 + Math.random() * 0.4),
    })
  }
  if (!raf) raf = requestAnimationFrame(tick)
}

function drawStar(c: CanvasRenderingContext2D, s: number) {
  c.beginPath()
  for (let k = 0; k < 10; k++) { const rr = k % 2 ? s * 0.45 : s; const a = -Math.PI / 2 + k * Math.PI / 5; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) }
  c.closePath(); c.fill()
}

function tick() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, innerWidth, innerHeight)
  for (const p of parts) {
    p.vx *= p.drag; p.vy = p.vy * p.drag + p.g
    p.x += p.vx + Math.sin(p.tilt) * 0.6; p.y += p.vy
    p.rot += p.vr; p.tilt += p.vt; p.life -= p.decay
    const flip = Math.cos(p.tilt)
    ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6))
    ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180); ctx.scale(1, flip)
    ctx.fillStyle = p.color; ctx.strokeStyle = p.color
    if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2)
    else if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2); ctx.fill() }
    else if (p.shape === 'star') drawStar(ctx, p.size * 0.8)
    else { ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-p.size, 0); ctx.bezierCurveTo(-p.size / 2, -p.size, p.size / 2, p.size, p.size, 0); ctx.stroke() }
    ctx.restore()
  }
  parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 60)
  raf = parts.length ? requestAnimationFrame(tick) : 0
  if (!parts.length) ctx.clearRect(0, 0, innerWidth, innerHeight)
}

/** small pop from an element (e.g. a button that was just clicked) */
export function pop(el: Element | null, count = 36) {
  if (reduced()) return
  ensure()
  const r = el?.getBoundingClientRect()
  const x = r ? r.left + r.width / 2 : innerWidth / 2, y = r ? r.top + r.height / 2 : innerHeight / 2
  // kept light: about a third of what callers ask for, so a click sparkles instead of showering the page
  spawn({ x, y, angle: -90, spread: 80, velocity: 7.5, count: Math.max(4, Math.round(count * 0.3)), gravity: 0.3 })
}

/** party: two small side cannons + a centre puff (deliberately modest) */
export function party() {
  if (reduced()) return
  ensure()
  const h = innerHeight
  spawn({ x: -10, y: h * 0.72, angle: -58, spread: 30, velocity: 19, count: 16 })
  spawn({ x: innerWidth + 10, y: h * 0.72, angle: -122, spread: 30, velocity: 19, count: 16 })
  setTimeout(() => spawn({ x: innerWidth / 2, y: h * 0.38, angle: -90, spread: 300, velocity: 9, count: 12, gravity: 0.22 }), 160)
}
