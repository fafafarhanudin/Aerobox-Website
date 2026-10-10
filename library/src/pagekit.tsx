import type React from 'react'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon, Tooltip, useToast } from './ui'

/** "← Back to main site" link that sits above the page eyebrow */
export function BackToSite() {
  return <a className="back-site" href="/"><Icon name="arrow-left" size={14} stroke={1.6} />Back to main site</a>
}

/* Page header: chip + title + description + right-hand action (matches the Figma page headers) */
export function PageHead({ chip, count, title, desc, action, fresh }: { chip: string; count: number | string; title: ReactNode; desc: string; action?: ReactNode; fresh?: number }) {
  return (
    <header className="ph">
      <div>
        <BackToSite />
        <div className="ph-eyebrow">
          <span className="ph-chip"><Icon name="grid" size={13} />{chip}<i>·</i><b className="mono">{count}</b></span>
          {!!fresh && <span className="ph-new"><i />{fresh} new</span>}
        </div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action && <div className="head-actions">{action}</div>}
    </header>
  )
}

/* 4-cell spec strip (Items / Formats / … / License) */
export function Summary({ cells }: { cells: [string, ReactNode][] }) {
  return <div className="summary">{cells.map(([k, v]) => <div key={k} className="sum-cell"><span>{k}</span><div>{v}</div></div>)}</div>
}
export const Formats = ({ list }: { list: string[] }) => <span className="fmt-row">{list.map(f => <span key={f} className="fmt">{f}</span>)}</span>

/* Pill dropdown: "Label Value ⌄" with a popover list */
export function Select<T extends string>({ label, value, options, onChange, render, disabled = [] }: { label: string; value: T; options: T[]; onChange: (v: T) => void; render?: (v: T) => ReactNode; disabled?: T[] }) {
  const [open, setOpen] = useState(false)
  useEffect(() => { if (!open) return; const c = () => setOpen(false); const id = setTimeout(() => addEventListener('click', c)); return () => { clearTimeout(id); removeEventListener('click', c) } }, [open])
  return (
    <div className="dd-wrap">
      <button className={`select ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="dim">{label}</span>{render ? render(value) : value}<Icon name="arrow-down" size={14} className="chev" />
      </button>
      <div className={`popover ${open ? 'on' : ''}`} onClick={e => e.stopPropagation()}>
        {options.map(o => (
          <button key={o} className={`pop-item ${o === value ? 'on' : ''}`} disabled={disabled.includes(o)} onClick={() => { onChange(o); setOpen(false) }}>
            <span className="pi-row">{render ? render(o) : o}</span>{disabled.includes(o) ? <span className="soon">Coming soon</span> : o === value ? <Icon name="arrow-right" size={12} className="tick" /> : null}
          </button>))}
      </div>
    </div>
  )
}

export function ViewToggle({ value, onChange }: { value: 'grid' | 'list'; onChange: (v: 'grid' | 'list') => void }) {
  return (
    <div className="view-toggle" role="radiogroup" aria-label="View">
      <span className="vt-ind" style={{ transform: `translateX(${value === 'grid' ? 0 : 36}px)` }} />
      <button className={value === 'grid' ? 'on' : ''} onClick={() => onChange('grid')} aria-label="Grid view"><Icon name="grid" size={16} /></button>
      <button className={value === 'list' ? 'on' : ''} onClick={() => onChange('list')} aria-label="List view"><Icon name="list" size={16} /></button>
    </div>
  )
}

export function PillTabs({ items, value, onChange, right }: { items: [string, number][]; value: string; onChange: (v: string) => void; right?: ReactNode }) {
  return (
    <div className="pill-tabs">
      <div className="pt-list">{items.map(([k, n]) => <button key={k} className={`pt ${value === k ? 'on' : ''}`} onClick={() => onChange(k)}>{k}<span className="mono">{n}</span></button>)}</div>
      {right && <span className="pt-right mono">{right}</span>}
    </div>
  )
}

/* ---------- floating settings dock (same look as the Icons dock) ---------- */
const DockCtx = createContext<{ open: string; setOpen: (v: string) => void }>({ open: '', setOpen: () => {} })
export function FloatDock({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(true); const [open, setOpen] = useState('')
  useEffect(() => { const f = document.querySelector('.footer'); if (!f) return; const io = new IntersectionObserver(([e]) => setOn(!e.isIntersecting), { rootMargin: '0px 0px -40px 0px' }); io.observe(f); return () => io.disconnect() }, [])
  useEffect(() => { const c = () => setOpen(''); addEventListener('click', c); return () => removeEventListener('click', c) }, [])
  return <DockCtx.Provider value={{ open, setOpen }}><div className={`dock center ${on ? 'on' : ''}`} onClick={e => e.stopPropagation()}>{children}</div></DockCtx.Provider>
}
export function DockPop({ id, label, value, icon, width = 264, children }: { id: string; label: string; value: ReactNode; icon?: ReactNode; width?: number; children: ReactNode }) {
  const { open, setOpen } = useContext(DockCtx); const on = open === id
  return (
    <div className="dd-wrap">
      <button className={`dock-style ${on ? 'open' : ''}`} onClick={() => setOpen(on ? '' : id)} aria-expanded={on}>{icon}<span className="dl">{label}</span> {value} <Icon name={on ? 'chevron-up' : 'chevron-down'} size={14} /></button>
      <div className={`popover up dark dock-pop ${on ? 'on' : ''}`} style={{ width }}>{children}</div>
    </div>
  )
}
export const DockDiv = () => <span className="dock-div" />
export function DkRow({ label, children }: { label: string; children: ReactNode }) { return <div className="dk-row"><span className="dk-label">{label}</span>{children}</div> }
export function DkSlider({ value, min, max, step = 1, onChange, unit = '' }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; unit?: string }) {
  return <div className="dk-slider"><input className="ge-range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ ['--p' as string]: `${(value - min) / (max - min) * 100}%` }} /><span className="mono">{value}{unit}</span></div>
}
export function DkChips<T extends string | number>({ options, value, onChange, locked = [], render }: { options: T[]; value: T; onChange: (v: T) => void; locked?: T[]; render?: (v: T) => ReactNode }) {
  return <div className="dk-chips">{options.map(o => <button key={String(o)} className={o === value ? 'on' : ''} disabled={locked.includes(o)} onClick={() => onChange(o)}>{render ? render(o) : o}{locked.includes(o) && <Icon name="lock" size={11} />}</button>)}</div>
}
export function DkSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return <button className={`dk-switch ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)}><i /></button>
}
export function DockStep({ label, value, onMinus, onPlus }: { label: string; value: ReactNode; onMinus: () => void; onPlus: () => void }) {
  return <div className="dock-step"><span className="dl">{label}</span><button onClick={onMinus} aria-label={`Less ${label}`}>−</button><b className="mono">{value}</b><button onClick={onPlus} aria-label={`More ${label}`}>+</button></div>
}

/* ---------- colour picker (HSV square + hue rail + curated palette) ---------- */
const hex2rgb = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255] }
const rgb2hex = (r: number, g: number, b: number) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
export const hex2hsv = (h: string): [number, number, number] => {
  const [r, g, b] = hex2rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  const hu = d === 0 ? 0 : mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [hu * 60, mx === 0 ? 0 : d / mx, mx]
}
export const hsv2hex = (h: number, s: number, v: number) => {
  const f = (n: number) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)) }
  return rgb2hex(f(5) * 255, f(3) * 255, f(1) * 255)
}
export const mixHex = (a: string, b: string, t: number) => { const x = hex2rgb(a), y = hex2rgb(b); return rgb2hex(...x.map((v, i) => v + (y[i] - v) * t) as [number, number, number]) }
const PICK_ROWS = [
  ['#16171B', '#3A3B42', '#6B6E78', '#A3A5AD', '#DCDEE3', '#FFFFFF'],
  ['#2F6BFF', '#0EA5E9', '#14B8A6', '#15803D', '#84CC16', '#F59E0B'],
  ['#7A5AF8', '#C026D3', '#EC4899', '#F43F5E', '#EF4444', '#F97316'],
]
const RECENT_KEY = 'aero-recent-colors'
const readRecent = (): string[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] } }
export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hsv, setHsv] = useState<[number, number, number]>(() => hex2hsv(value)); const [text, setText] = useState(value)
  const [recent, setRecent] = useState<string[]>(readRecent)
  useEffect(() => { if (hsv2hex(...hsv) !== value.toUpperCase()) setHsv(hex2hsv(value)); setText(value.toUpperCase()) }, [value]) // eslint-disable-line react-hooks/exhaustive-deps
  const remember = (c: string) => { const r = [c, ...recent.filter(x => x !== c)].slice(0, 6); setRecent(r); try { localStorage.setItem(RECENT_KEY, JSON.stringify(r)) } catch { /* private mode */ } }
  const commit = (h: number, s: number, v: number) => { setHsv([h, s, v]); onChange(hsv2hex(h, s, v)) }
  const drag = (el: HTMLElement, fn: (x: number, y: number) => void) => (e: React.PointerEvent) => {
    const r = el.getBoundingClientRect(); const mv = (ev: PointerEvent | React.PointerEvent) => fn(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)))
    mv(e); const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); remember(hsv2hex(...hsvRef.current)) }
    addEventListener('pointermove', mv); addEventListener('pointerup', up)
  }
  const hsvRef = useRef(hsv); hsvRef.current = hsv
  const sq = useRef<HTMLDivElement>(null), rail = useRef<HTMLDivElement>(null)
  const [h, s, v] = hsv; const cur = hsv2hex(h, s, v)
  const pick = (c: string) => { setHsv(hex2hsv(c)); onChange(c); remember(c) }
  const eye = async () => { const ED = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper; if (!ED) return; try { const r = await new ED().open(); pick(r.sRGBHex.toUpperCase()) } catch { /* cancelled */ } }
  return (
    <div className="cpk" onClick={e => e.stopPropagation()}>
      <div ref={sq} className="cpk-sq" style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h} 100% 50%))` }}
        onPointerDown={e => drag(sq.current!, (x, y) => commit(hsvRef.current[0], x, 1 - y))(e)}>
        <i style={{ left: `${s * 100}%`, top: `${(1 - v) * 100}%`, background: cur }} />
      </div>
      <div className="cpk-row">
        <span className="cpk-now" style={{ background: cur }} />
        <div ref={rail} className="cpk-hue" onPointerDown={e => drag(rail.current!, x => commit(x * 360, hsvRef.current[1], hsvRef.current[2]))(e)}><i style={{ left: `${h / 360 * 100}%`, background: `hsl(${h} 100% 50%)` }} /></div>
      </div>
      <div className="cpk-row">
        <label className="cpk-hex"><span>HEX</span><input value={text} spellCheck={false} maxLength={7}
          onChange={e => { const t = e.target.value.toUpperCase(); setText(t); if (/^#[0-9A-F]{6}$/.test(t)) { setHsv(hex2hsv(t)); onChange(t) } }} onBlur={() => remember(cur)} /></label>
        {'EyeDropper' in window && <Tooltip label="Pick from screen"><button className="cpk-eye" onClick={eye} aria-label="Pick from screen"><Icon name="pipette" size={15} /></button></Tooltip>}
      </div>
      <div className="cpk-pal">{PICK_ROWS.flat().map(c => <button key={c} className={c === cur ? 'on' : ''} style={{ background: c }} onClick={() => pick(c)} aria-label={c} />)}</div>
      {recent.length > 0 && <><span className="cpk-label">Recent</span><div className="cpk-pal">{recent.map(c => <button key={c} className={c === cur ? 'on' : ''} style={{ background: c }} onClick={() => pick(c)} aria-label={c} />)}</div></>}
    </div>
  )
}
/** round "custom colour" well that sits at the end of a dock swatch row */
export function ColorWell({ on, color, onClick }: { on: boolean; color: string; onClick: () => void }) {
  return <Tooltip label="Custom colour"><button className={`cwell ${on ? 'on' : ''}`} onClick={onClick} aria-label="Custom colour"><i style={{ background: on ? color : undefined }} /></button></Tooltip>
}
/** ColorWell + picker popover wired into the FloatDock open/close context */
export function DockColor({ id = 'color', on, value, onChange }: { id?: string; on: boolean; value: string; onChange: (v: string) => void }) {
  const { open, setOpen } = useContext(DockCtx); const shown = open === id
  return <div className="dd-wrap"><ColorWell on={on} color={value} onClick={() => setOpen(shown ? '' : id)} />
    <div className={`popover up dark cpk-pop ${shown ? 'on' : ''}`}>{shown && <ColorPicker value={value} onChange={onChange} />}</div></div>
}

/** "Download all assets" — visible but locked until the full pack ships */
export function DockDownloadAll({ label = 'Download all' }: { label?: string }) {
  const toast = useToast()
  return (
    <Tooltip label="Download the whole library · coming soon">
      <button className="dock-dl" aria-disabled="true" onClick={() => toast('Download all is coming soon')}>
        <Icon name="lock" size={13} stroke={1.8} /><span>{label}</span><Icon name="download" size={14} />
      </button>
    </Tooltip>
  )
}
