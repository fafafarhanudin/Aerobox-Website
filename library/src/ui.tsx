import type React from 'react'
import { creditSvg } from './lib/credit'
import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ICONS } from './data/icons'
import { UI_ICONS } from './data/icons-ui'
import { AeroboxLogo } from './logo'

// interface glyphs by plain name; library icons under a `u:` key so the two sets never collide
const DATA = new Map([...UI_ICONS.map(i => [i.name, i] as const), ...ICONS.map(i => ['u:' + i.name, i] as const)])
export const libKey = (name: string) => 'u:' + name
export type IconStyle = 'Aero' | 'Duotone' | 'Filled' | 'Sharp' | 'Pixel' | '3D' | 'Glass'
export const ICON_STYLES: IconStyle[] = ['Aero', 'Duotone', 'Filled', 'Sharp', 'Pixel', '3D', 'Glass']
/* Pixel style: the outline is rasterised once on a 16×16 grid, then emitted as merged pixel runs */
const pixCache = new Map<string, string>()
function pixels(name: string, stroke: number) {
  const key = `${name}|${stroke}`; const hit = pixCache.get(key); if (hit !== undefined) return hit
  const ic = DATA.get(name); if (!ic || typeof document === 'undefined') return ''
  const N = 16, cv = document.createElement('canvas'); cv.width = cv.height = N
  const x = cv.getContext('2d')!; x.scale(N / 24, N / 24); x.lineWidth = Math.max(stroke, 1.5); x.lineCap = 'round'; x.lineJoin = 'round'
  for (const [, el] of ic.parts) {
    const a = Object.fromEntries([...el.matchAll(/([a-z-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]))
    const p = new Path2D()
    if (el.startsWith('<path')) p.addPath(new Path2D(a.d))
    else if (el.startsWith('<circle')) p.arc(+a.cx, +a.cy, +a.r, 0, Math.PI * 2)
    else if (el.startsWith('<ellipse')) p.ellipse(+a.cx, +a.cy, +a.rx, +a.ry, 0, 0, Math.PI * 2)
    else if (el.startsWith('<rect')) p.roundRect(+a.x, +a.y, +a.width, +a.height, +(a.rx || 0))
    x.stroke(p)
  }
  const d = x.getImageData(0, 0, N, N).data, u = 24 / N; let out = ''
  for (let y = 0; y < N; y++) {
    let run = -1
    for (let i = 0; i <= N; i++) {
      const on = i < N && d[(y * N + i) * 4 + 3] > 100
      if (on && run < 0) run = i
      if (!on && run >= 0) { out += `<rect x="${run * u}" y="${y * u}" width="${(i - run) * u}" height="${u}"/>`; run = -1 }
    }
  }
  pixCache.set(key, out); return out
}
const withAttrs = (el: string, attrs: string) => el.replace('/>', ` ${attrs}/>`)
/* Aero signature: every line icon carries one break in its longest stroke — line, gap, one long dash, gap, line.
   Measured once per icon in the browser (getTotalLength) on a straight stretch, so new icons get it automatically. */
const EL = /<(?:path|circle|ellipse|rect|line|polyline|polygon)\b[^>]*\/>/g
type Sig = { i: number; at: number } | null
const sigCache = new Map<string, Sig>()
let probe: SVGGElement | null = null
const SIGNATURE_BREAK = false
const SPAN = 2 * 2.6 + 4.2 // gap·long dash·gap at the default 1.5 stroke
/* Placement rules, so the mark never changes what the icon says:
   1. only the middle of a straight run, with room to spare at both ends (no corners, no curves, no line ends)
   2. closed shapes (frames, bodies) first; open strokes only when they are long, never short meaning-carrying marks
   3. the whole break keeps clear of every other element, so no junction or crossing is cut
   4. among safe spots prefer the lowest horizontal run, so the mark sits in the same place across the set */
function signature(key: string, body: string, kinds: string[]): Sig {
  if (sigCache.has(key)) return sigCache.get(key)!
  if (typeof document === 'undefined') return null
  if (!probe) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.cssText = 'position:absolute;left:-99px;top:-99px;visibility:hidden'
    probe = document.createElementNS('http://www.w3.org/2000/svg', 'g'); svg.appendChild(probe); document.body.appendChild(svg)
  }
  probe.innerHTML = body
  const els = [...probe.children] as SVGGeometryElement[], STEP = .5
  const pts = els.map(el => { const L = el.getTotalLength?.() ?? 0, out: DOMPoint[] = []; for (let t = 0; t <= L; t += STEP) out.push(el.getPointAtLength(t)); return { L, out } })
  const longest = Math.max(0, ...pts.map(p => p.L))
  type Run = { i: number; a: number; b: number; dir: number; y: number; total: number }
  const runs: Run[] = []
  pts.forEach(({ L, out }, i) => {
    const closed = kinds[i] !== 'o'
    if (L < (closed ? 18 : Math.max(26, longest * .6))) return
    let a = 0
    const ang = (k: number) => Math.atan2(out[k + 1].y - out[k].y, out[k + 1].x - out[k].x)
    // a run is a stretch with no corner: straight, or a gentle curve (radius ≥ ~6 units); tight rounded corners end it
    const bend = (k: number) => { const d = Math.abs(ang(k) - ang(k - 1)); return Math.min(d, Math.PI * 2 - d) }
    for (let k = 1; k < out.length - 1; k++) {
      if (bend(k) > .085 || k === out.length - 2) {
        const b = bend(k) > .085 ? k : k + 1
        if ((b - a) * STEP >= SPAN + 1) {
          const m = Math.round((a + b) / 2), d = Math.abs(ang(b - 1) - ang(a)), total = Math.min(d, Math.PI * 2 - d)
          runs.push({ i, a: a * STEP, b: b * STEP, dir: ang(m), y: out[m].y, total })
        }
        a = k
      }
    }
  })
  const clear = (r: Run) => {
    const mid = (r.a + r.b) / 2, el = els[r.i]
    for (let t = mid - SPAN / 2; t <= mid + SPAN / 2; t += STEP) {
      const p = el.getPointAtLength(t)
      for (let j = 0; j < pts.length; j++) {
        if (j === r.i) continue
        if (pts[j].out.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 2.1)) return false
      }
      // the same element doubling back nearby (e.g. a thin slot) counts too
      if (pts[r.i].out.some((q, k) => Math.abs(k * STEP - t) > SPAN && Math.hypot(q.x - p.x, q.y - p.y) < 2.1)) return false
    }
    return true
  }
  const score = (r: Run) => Math.min(r.b - r.a, 16) + (kinds[r.i] !== 'o' ? 30 : 0) + (r.total < .1 ? 8 : 0) + (Math.abs(Math.sin(r.dir)) < .2 ? 6 : 0) + r.y * .5
  const best = runs.sort((p, q) => score(q) - score(p)).find(clear)
  const sig: Sig = best ? { i: best.i, at: f2((best.a + best.b) / 2) } : null
  sigCache.set(key, sig); return sig
}
/** apply the signature dash to the chosen element of an icon body */
function signed(key: string, body: string, stroke: number, kinds: string[]) {
  if (!SIGNATURE_BREAK) return body // icons are drawn unbroken now; the Aero character lives in the shapes
  const sig = signature(key, body, kinds); if (!sig) return body
  // round caps eat stroke/2 of every gap, so gaps are sized from the stroke; the group is centred on sig.at
  const g = f2(stroke + 1.1), dash = 4.2, span = 2 * g + dash, els = body.match(EL) ?? []
  const dashes = `${f2(Math.max(.01, sig.at - span / 2))} ${g} ${dash} ${g} 999`
  return els.map((el, i) => i === sig.i ? withAttrs(el, `stroke-dasharray="${dashes}"`) : el).join('')
}
/** gradient paint for icons — drawn in the 24×24 user space so straight lines never get a degenerate bounding box */
export type Grad = { stops: string[]; angle: number }
export const gradCss = (g: Grad) => `linear-gradient(${g.angle}deg, ${g.stops.join(', ')})`
const f2 = (n: number) => +n.toFixed(2)
const f = f2
const gradDef = (g: Grad, id: string) => {
  const a = g.angle * Math.PI / 180, sn = Math.sin(a), cs = Math.cos(a), h = 12 * (Math.abs(sn) + Math.abs(cs))
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f2(12 - sn * h)}" y1="${f2(12 + cs * h)}" x2="${f2(12 + sn * h)}" y2="${f2(12 - cs * h)}">` +
    g.stops.map((c, i) => `<stop offset="${f2(i / (g.stops.length - 1))}" stop-color="${c}"/>`).join('') + `</linearGradient></defs>`
}
function build(name: string, style: IconStyle, stroke: number, color: string, uid: string, grad?: Grad) {
  if (!grad) return paint(name, style, stroke, color, uid)
  const r = paint(name, style, stroke, `url(#g${uid})`, uid)
  return { root: r.root, inner: gradDef(grad, `g${uid}`) + r.inner }
}
/** root attributes + inner markup for one icon in one style (stroke-only except the Filled masks) */
function paint(name: string, style: IconStyle, stroke: number, color: string, uid: string) {
  const ic = DATA.get(name)
  if (!ic) return { root: 'fill="none"', inner: '' }
  const line = `stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`
  if (style === 'Sharp') return { root: `fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="square" stroke-linejoin="miter"`, inner: signed(name + '|s', ic.sharp, stroke, ic.parts.map(p => p[0])) }
  if (style === 'Pixel') return { root: `fill="${color}" shape-rendering="crispEdges"`, inner: pixels(name, stroke) }
  if (style === '3D') {
    const b = signed(name, ic.body, stroke, ic.parts.map(p => p[0]))
    return { root: `fill="none" stroke="${color}" ${line}`, inner: `<g transform="translate(.9 1.15)" opacity=".2">${b}</g><g transform="translate(.45 .58)" opacity=".42">${b}</g>${b}<g stroke="#fff" stroke-opacity=".62" stroke-width="${f(stroke * .32)}" transform="translate(-.16 -.2)">${b}</g>` }
  }
  if (style === 'Glass') {
    const closed = ic.parts.filter(p => p[0] === 'c').map(p => p[1]).join(''), fid = `gl${uid}`
    return { root: 'fill="none"', inner: `<defs><filter id="${fid}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.15"/></filter></defs>` +
      `<g filter="url(#${fid})" transform="translate(1.3 1.7)" opacity=".75" fill="${color}" stroke="${color}" stroke-width="${f(stroke * 1.7)}" stroke-linecap="round" stroke-linejoin="round">${ic.body}</g>` +
      `<g fill="#fff" fill-opacity=".6" stroke="none">${closed}</g><g fill="none" stroke="${color}" ${line}>${ic.body}</g>` +
      `<g fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="${f(stroke * .34)}" stroke-linecap="round" transform="translate(-.18 -.22)">${closed}</g>` }
  }
  if (style === 'Duotone') {
    const els = signed(name, ic.body, stroke, ic.parts.map(p => p[0])).match(EL) ?? []
    return { root: `fill="none" stroke="${color}" ${line}`, inner: ic.parts.map(([k], i) => k === 'c' ? withAttrs(els[i], `fill="${color}" fill-opacity=".2"`) : els[i]).join('') }
  }
  if (style === 'Filled') {
    const outer = ic.parts.filter(p => p[0] === 'c').map(p => p[1]).join(''), holes = ic.parts.filter(p => p[0] === 'h').map(p => p[1]).join(''), open = ic.parts.filter(p => p[0] === 'o').map(p => p[1]).join('')
    const m1 = `f1${uid}`, m2 = `f2${uid}`
    const inner = `<defs><mask id="${m1}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#000"/><g fill="#fff">${outer}</g>` +
      `<g fill="#000" stroke="#000" ${line}>${holes}</g><g fill="none" stroke="#000" ${line}>${open}</g><g fill="none" stroke="#fff" ${line}>${outer}</g></mask>` +
      `<mask id="${m2}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="#fff"/><g fill="#000" stroke="#000" ${line}>${outer}</g></mask></defs>` +
      (outer ? `<rect width="24" height="24" fill="${color}" mask="url(#${m1})"/>` : '') + `<g fill="none" stroke="${color}" ${line} mask="url(#${m2})">${open}</g>`
    return { root: 'fill="none"', inner }
  }
  return { root: `fill="none" stroke="${color}" ${line}`, inner: signed(name, ic.body, stroke, ic.parts.map(p => p[0])) }
}

/* ---------- Aero icon (4 styles, weight adjustable) ---------- */
export function Icon({ name, size = 20, stroke = 1.9, color = 'currentColor', variant = 'Aero', grad, className, style }: { name: string; size?: number; stroke?: number; color?: string; variant?: IconStyle; grad?: Grad; className?: string; style?: CSSProperties }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const { root, inner } = build(name, variant, stroke, color, uid, grad)
  const attrs = Object.fromEntries([...root.matchAll(/([a-z-]+)="([^"]*)"/g)].map(([, k, v]) => [k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v]))
  return <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden {...attrs} dangerouslySetInnerHTML={{ __html: inner }} />
}
export const iconSvg = (name: string, stroke = 1.5, color = 'currentColor', size = 24, variant: IconStyle = 'Aero', grad?: Grad) => {
  const { root, inner } = build(name, variant, stroke, color, `${name}-${Math.random().toString(36).slice(2, 7)}`, grad)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${root}>${inner}</svg>`
}

export function XLogo({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><path fill={color} d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" /></svg>
}

export function BrandMark({ size = 28 }: { size?: number }) { return <AeroboxLogo size={size} className="brand-mark" /> }

/** logo marks share gradient ids (a, b, h) — make them unique per instance */
export function Mark({ svg, size = 40 }: { svg: string; size?: number }) {
  const id = useId().replace(/:/g, '')
  const html = svg.replace(/id="(\w)"/g, `id="${id}$1"`).replace(/url\(#(\w)\)/g, `url(#${id}$1)`).replace('width="40" height="40"', `width="${size}" height="${size}"`)
  return <span className="mark" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: html }} />
}

/* ---------- Tooltip ---------- */
export function Tooltip({ label, children, side = 'top', kbd, delay = 120 }: { label: ReactNode; children: ReactNode; side?: 'top' | 'bottom'; kbd?: string; delay?: number }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null); const t = useRef<number>(0)
  const show = () => { window.clearTimeout(t.current); t.current = window.setTimeout(() => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return
    setPos({ x: r.left + r.width / 2, y: side === 'top' ? r.top : r.bottom }); setOpen(true) }, delay) }
  const hide = () => { window.clearTimeout(t.current); setOpen(false) }
  useEffect(() => () => window.clearTimeout(t.current), [])
  return (
    <span ref={ref} className="tt-anchor" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onMouseDown={hide}>
      {children}
      {pos && createPortal(
        <span className={`tooltip ${side} ${open ? 'on' : ''}`} style={{ left: pos.x, top: pos.y }} role="tooltip">
          <span className="tooltip-body">{label}{kbd && <kbd>{kbd}</kbd>}</span>
        </span>, document.body)}
    </span>
  )
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, children, width = 560, label, tone = 'light' }: { open: boolean; onClose: () => void; children: ReactNode; width?: number; label: string; tone?: 'light' | 'dark' }) {
  const [mounted, setMounted] = useState(open); const [shown, setShown] = useState(false)
  useLayoutEffect(() => {
    if (open) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))) }
    else { setShown(false); const id = window.setTimeout(() => setMounted(false), 260); return () => window.clearTimeout(id) }
  }, [open])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    addEventListener('keydown', k); document.documentElement.classList.add('modal-open')
    return () => { removeEventListener('keydown', k); document.documentElement.classList.remove('modal-open') }
  }, [open, onClose])
  if (!mounted) return null
  return createPortal(
    <div className={`modal-root ${shown ? 'on' : ''}`} role="dialog" aria-modal aria-label={label}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal-panel ${tone}`} style={{ width }}>{children}</div>
    </div>, document.body)
}
export function CloseButton({ onClick }: { onClick: () => void }) {
  return <button className="icon-btn close" onClick={onClick} aria-label="Close"><svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 2 10 10M10 2 2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
}

/* ---------- Toasts ---------- */
type ToastItem = { id: number; text: ReactNode; icon?: string }
const ToastCtx = createContext<(text: ReactNode, icon?: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = useCallback((text: ReactNode, icon = 'copy') => {
    const id = Date.now() + Math.random()
    setItems(s => [...s.slice(-2), { id, text, icon }])
    window.setTimeout(() => setItems(s => s.filter(t => t.id !== id)), 2200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {createPortal(<div className="toasts">{items.map(t => <div key={t.id} className="toast"><span className="toast-ic"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7.2 5.8 10 11 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>{t.text}</div>)}</div>, document.body)}
    </ToastCtx.Provider>
  )
}

export async function copyText(raw: string, name?: string) {
  const text = creditSvg(raw, name)
  try { await navigator.clipboard.writeText(text); return true } catch {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select()
    try { document.execCommand('copy') } catch { /* ignore */ } ta.remove(); return true
  }
}
export function download(name: string, content: string, type = 'image/svg+xml') {
  const body = type.includes('svg') ? creditSvg(content, name) : content
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type })); a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

/** reveal-on-scroll helper */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect() } }), { threshold: 0.12 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return ref
}

/* ---------- Keycap button (same construction as aerobox-website .key) ---------- */
type KeyProps = {
  variant?: 'secondary' | 'primary' | 'accent'; size?: 'sm' | 'md' | 'lg'; grow?: boolean; square?: boolean; pressed?: boolean
  href?: string; target?: string; children: ReactNode; className?: string; capClassName?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>
export function Key({ variant = 'secondary', size = 'md', grow, square, pressed, href, target, children, className = '', capClassName = '', ...rest }: KeyProps) {
  const cls = ['key', variant !== 'secondary' && `key--${variant}`, size !== 'md' && `key--${size}`, grow && 'key--grow', square && 'key--square', className].filter(Boolean).join(' ')
  const cap = <span className={`key__cap ${capClassName}`}>{children}</span>
  if (href) return <a href={href} target={target} rel={target ? 'noopener noreferrer' : undefined} className={cls} data-pressed={pressed || undefined} onClick={rest.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>{cap}</a>
  return <button type="button" className={cls} data-pressed={pressed || undefined} {...rest}>{cap}</button>
}
export function Legend({ children }: { children: ReactNode }) { return <span className="legend" aria-hidden>{children}</span> }
