import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { CloseButton, Icon, Mark, Modal, Tooltip, copyText, download, useToast, Key, Legend, XLogo } from '../ui'
import { DkChips, DkRow, DkSwitch, DockDiv, DockPop, DockStep, FloatDock, DockDownloadAll, PageHead, PillTabs, Select, ViewToggle } from '../pagekit'
import { MARKS } from '../data/logos'
import { WORLD, type World } from '../data/world'
import { LOCKUPS, type Lockup } from '../data/lockups'
import { pop } from '../lib/confetti'
import { RequestKey } from '../request'
import { TONES, TONE_SWATCH, fetchSvg, toneAccent, toneInk, toneSvg, type Tone } from '../lib/tone'

const FONTS = ['Outfit', 'Space Grotesk', 'Manrope', 'Syne', 'Nunito', 'Poppins', 'Rubik', 'Fredoka']
const WCATS = ['All', 'AI', 'Software', 'Dev', 'Data', 'Design', 'Social', 'Payments', 'Brands']
type M = typeof MARKS[number]
type Mode = 'world' | 'templates'
const PAGE = 50
const SCALES = [.75, .875, 1, 1.125, 1.25, 1.5]
function LookPop({ tone, setTone, boxed, setBoxed }: { tone: Tone; setTone: (v: Tone) => void; boxed: boolean; setBoxed: (v: boolean) => void }) {
  return (
    <DockPop id="look" label="Colour" value={tone} icon={<i className="tone-dot" style={{ background: TONE_SWATCH[tone] }} />} width={300}>
      <div className="tone-grid">{TONES.map(t => (
        <button key={t} className={t === tone ? 'on' : ''} onClick={() => setTone(t)}><i className="tone-dot lg" style={{ background: TONE_SWATCH[t] }} />{t}</button>))}</div>
      <div className="dk-sep" />
      <DkRow label="Icon box"><DkSwitch on={boxed} onChange={setBoxed} /></DkRow>
      <p className="dk-note">Copy and Download export the colour you pick here.</p>
    </DockPop>
  )
}
/** brand logo file, recoloured on the fly when a colour mode is active */
function ToneImg({ src, tone, className, alt = '' }: { src: string; tone: Tone; className?: string; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (tone === 'Original') { setUrl(null); return }
    let live = true; let u = ''
    fetchSvg(src).then(t => { if (!live) return; u = URL.createObjectURL(new Blob([toneSvg(t, tone)], { type: 'image/svg+xml' })); setUrl(u) })
    return () => { live = false; if (u) URL.revokeObjectURL(u) }
  }, [src, tone])
  return <img src={tone === 'Original' ? src : url ?? src} alt={alt} className={`${className ?? ''} ${tone !== 'Original' && !url ? 'toning' : ''}`} loading="lazy" />
}
const SOON = 'Coming soon'
export const X_URL = 'https://x.com/ui_farhan'

const fileOf = (w: World, theme: 'Light' | 'Dark', variant: 'Icon' | 'Wordmark') => {
  const f = w.files
  if (variant === 'Wordmark' && f.wm) return `/library/world/${theme === 'Dark' && f['wm-dark'] ? f['wm-dark'] : f.wm}`
  return `/library/world/${theme === 'Dark' && f.dark ? f.dark : f.light}`
}

export default function LogosPage() {
  const [mode, setMode] = useState<Mode>(() => (sessionStorage.getItem('logos-mode') as Mode) || 'world')
  useEffect(() => { try { sessionStorage.setItem('logos-mode', mode) } catch { /* ignore */ } }, [mode])
  const toggle = <ModeToggle mode={mode} onChange={setMode} />
  return (
    <div className="page logos-page">
      <div key={mode} className="mode-body">{mode === 'world' ? <WorldLogos toggle={toggle} /> : <Templates toggle={toggle} />}</div>
    </div>
  )
}

/* Real-world ↔ Templates switch, placed under the page subtitle. The page body remounts on switch,
   so the pill slides from the previous position and the chosen icon lights up with a confetti pop. */
let lastMode: Mode | null = null
function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const [ind, setInd] = useState<Mode>(lastMode ?? mode)
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const changed = lastMode !== null && lastMode !== mode; lastMode = mode
    const r = requestAnimationFrame(() => setInd(mode))
    if (changed) { setLit(true); const t = window.setTimeout(() => setLit(false), 1400); return () => { cancelAnimationFrame(r); window.clearTimeout(t) } }
    return () => cancelAnimationFrame(r)
  }, [mode])
  const tabs: [Mode, string, string, number][] = [['world', 'globe', 'Real-world logos', WORLD.length], ['templates', 'star', 'Logo templates', LOCKUPS.length + MARKS.length]]
  return (
    <div className="mode-toggle" role="tablist" aria-label="Logo library">
      <span className="mt-ind" style={{ transform: `translateX(${ind === 'world' ? 0 : 100}%)` }} />
      {tabs.map(([m, ic, label, n]) => (
        <button key={m} role="tab" aria-selected={mode === m} className={`${mode === m ? 'on' : ''} ${mode === m && lit ? 'lit' : ''}`}
          onClick={e => { if (m !== mode) { pop(e.currentTarget, 30); onChange(m) } }}>
          <span className={`mt-ic ${m}`}><Icon name={ic} size={16} variant={mode === m ? 'Filled' : 'Aero'} /></span>{label}<span className="mono">{n}</span>
        </button>))}
    </div>
  )
}

/* ---------------- Real-world logos (Figma 2640:3504) ---------------- */
function WorldLogos({ toggle }: { toggle: React.ReactNode }) {
  const toast = useToast()
  const [cat, setCat] = useState('All'); const [q, setQ] = useState(''); const [theme, setTheme] = useState<'Light' | 'Dark'>('Light'); const [variant, setVariant] = useState<'Icon' | 'Wordmark'>('Icon')
  const [sort, setSort] = useState<'Popular' | 'A–Z'>('Popular'); const [view, setView] = useState<'grid' | 'list'>('grid'); const [shown, setShown] = useState(PAGE); const [sel, setSel] = useState<World | null>(null)
  const [flip, setFlip] = useState<Record<string, boolean>>({})
  const [scale, setScale] = useState(1); const [tone, setTone] = useState<Tone>('Original'); const [boxed, setBoxed] = useState(false)
  useEffect(() => setShown(PAGE), [cat, q])
  // White logos need a dark tile; recoloured logos start from the light artwork
  const tileTheme = tone === 'White' ? 'Dark' : tone === 'Original' ? theme : 'Light'
  const list = useMemo(() => {
    let l = WORLD.filter(w => (cat === 'All' || w.cat === cat) && w.name.toLowerCase().includes(q.toLowerCase()))
    if (sort === 'A–Z') l = [...l].sort((a, b) => a.name.localeCompare(b.name))
    return l
  }, [cat, q, sort])
  const visible = list.slice(0, shown)
  const grab = async (w: World, th = theme) => toneSvg(await fetchSvg(fileOf(w, tone === 'Original' ? th : 'Light', variant)), tone)
  const dl = async (w: World) => { download(`${w.name.toLowerCase().replace(/\W+/g, '-')}.svg`, await grab(w)); toast(<>Downloaded <b>{w.name}</b></>) }
  const cp = async (w: World, el: Element) => { await copyText(await grab(w)); pop(el, 18); toast(<>Copied <b>{w.name}</b> SVG</>) }
  return (
    <>
      <PageHead chip="Real-world" count={WORLD.length} title="Real-world logos" desc={`${WORLD.length} brand logos for interfaces, docs and decks. Light, dark and wordmark versions when the brand provides them.`}
        action={<RequestKey kind="logo" legend="L" />} />
      {toggle}
      <div className="toolbar2">
        <label className="search sm"><Icon name="search" size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${WORLD.length} logos...`} /></label>
        <Select label="Sort" value={sort} options={['Popular', 'A–Z']} onChange={setSort} />
        <ViewToggle value={view} onChange={setView} />
      </div>
      <PillTabs items={WCATS.map(c => [c, c === 'All' ? WORLD.length : WORLD.filter(w => w.cat === c).length])} value={cat} onChange={setCat}
        right={`Showing ${visible.length} of ${list.length}${cat === 'All' ? '' : ` in ${cat}`}`} />
      {view === 'grid' ? (
        <div className={`world-grid ${tileTheme === 'Dark' ? 'dark' : ''} ${boxed ? 'boxed' : ''}`} style={{ ['--ls' as string]: scale }}>
          {visible.map((w, k) => {
            const th = flip[w.name] ? (tileTheme === 'Dark' ? 'Light' : 'Dark') : tileTheme
            return (
              <div key={w.name} className={`wl-tile ${th === 'Dark' ? 'is-dark' : ''}`} style={{ ['--i' as string]: k % PAGE }} onClick={() => setSel(w)}>
                <span className="wl-logo"><ToneImg src={fileOf(w, tone === 'Original' ? th : 'Light', variant)} tone={tone} alt={w.name} className={variant === 'Wordmark' && w.files.wm ? 'wm' : ''} /></span>
                <b>{w.name}</b><span>{w.sub}</span>
                <div className="wl-actions" onClick={e => e.stopPropagation()}>
                  <Tooltip label="Copy SVG"><button onClick={async e => { const el = e.currentTarget; await copyText(await grab(w, th)); pop(el, 18); toast(<>Copied <b>{w.name}</b> SVG</>) }}><Icon name="copy" size={15} /></button></Tooltip>
                  <Tooltip label={th === 'Dark' ? 'Light preview' : 'Dark preview'}><button onClick={() => setFlip(f => ({ ...f, [w.name]: !f[w.name] }))}><Icon name="sun" size={15} /></button></Tooltip>
                  <Tooltip label="Download SVG"><button onClick={() => dl(w)}><Icon name="download" size={15} /></button></Tooltip>
                  <Tooltip label="Preview"><button onClick={() => setSel(w)}><Icon name="eye" size={15} /></button></Tooltip>
                  <Tooltip label="Brand site"><a href={w.url} target="_blank" rel="noreferrer"><Icon name="external-link" size={15} /></a></Tooltip>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="iso-list">
          {visible.map((w, k) => (
            <div key={w.name} className="il-row" style={{ ['--i' as string]: k % PAGE }} onClick={() => setSel(w)}>
              <span className="wl-thumb"><ToneImg src={fileOf(w, 'Light', variant)} tone={tone === 'White' ? 'Black' : tone} /></span>
              <b>{w.name}</b><span className="dim">{w.cat} · {w.sub}</span><span />
              <span className="il-actions" onClick={e => e.stopPropagation()}>
                <Key size="sm" onClick={e => cp(w, e.currentTarget)}><Icon name="copy" size={14} /> Copy SVG</Key>
                <Key size="sm" onClick={() => dl(w)}><Icon name="download" size={14} /></Key>
              </span>
            </div>
          ))}
        </div>
      )}
      {list.length === 0 && <div className="empty"><Icon name="search" size={28} /><b>No logos match “{q}”</b></div>}
      {shown < list.length && <div className="load-more"><Key onClick={() => setShown(s => s + PAGE)}>Load more logos <Legend>↓</Legend></Key><span className="mono dim">{visible.length} of {list.length}</span></div>}

      <Modal open={!!sel} onClose={() => setSel(null)} label="Logo" width={560}>
        {sel && <div className="logo-modal">
          <div className="im-head"><b>{sel.name}</b><span className="badge-n">{sel.cat}</span><span className="badge-n">{sel.sub}</span><CloseButton onClick={() => setSel(null)} /></div>
          <div className="wl-preview">
            <div className="light"><ToneImg src={fileOf(sel, tone === 'Original' ? 'Light' : 'Light', variant)} tone={tone === 'White' ? 'Black' : tone} /><span className="mono">Light</span></div>
            <div className="dark"><ToneImg src={fileOf(sel, tone === 'Original' ? 'Dark' : 'Light', variant)} tone={tone === 'Original' ? tone : tone === 'Black' ? 'White' : tone} /><span className="mono">Dark</span></div>
          </div>
          <div className="im-foot"><span className="mono dim">Trademarks belong to their owners</span><div className="row">
            <Key onClick={e => cp(sel, e.currentTarget)}>Copy SVG</Key>
            <Key href={sel.url} target="_blank">Brand site <Icon name="arrow-up-right" size={14} /></Key>
            <Key variant="primary" onClick={e => { dl(sel); pop(e.currentTarget, 24) }}>Download</Key>
          </div></div>
        </div>}
      </Modal>
      <FloatDock>
        <DockPop id="theme" label="Theme" value={theme} icon={<Icon name={theme === 'Dark' ? 'moon' : 'sun'} size={15} color="#fff" />} width={220}>
          <DkRow label="Tiles"><DkChips options={['Light', 'Dark'] as const} value={theme} onChange={setTheme} /></DkRow>
        </DockPop>
        <DockDiv />
        <DockPop id="variant" label="Variant" value={variant} icon={<Icon name="layers" size={15} color="#fff" />} width={240}>
          <DkRow label="Show"><DkChips options={['Icon', 'Wordmark'] as const} value={variant} onChange={setVariant} /></DkRow>
          <p className="dk-note">Brands without a wordmark keep their icon.</p>
        </DockPop>
        <DockDiv />
        <DockStep label="Size" value={`${Math.round(scale * 100)}%`} onMinus={() => setScale(v => SCALES[Math.max(0, SCALES.indexOf(v) - 1)])} onPlus={() => setScale(v => SCALES[Math.min(SCALES.length - 1, SCALES.indexOf(v) + 1)])} />
        <DockDiv />
        <LookPop tone={tone} setTone={setTone} boxed={boxed} setBoxed={setBoxed} />
        <DockDiv /><DockDownloadAll />
      </FloatDock>
    </>
  )
}

/* ---------------- Logo templates (our own marks + lockups) ---------------- */
function Wordmark({ l, dark, tone = 'Original' }: { l: Lockup; dark: boolean; tone?: Tone }) {
  const n = l.name, q = l.quirk, ink = tone !== 'Original' ? toneInk(tone) : dark ? '#fff' : '#101828', acc = tone !== 'Original' ? toneAccent(tone) : l.color
  const parts: React.ReactNode[] = []
  if (q.t === 'accent') parts.push(n.slice(0, q.i), <span key="a" style={{ color: acc }}>{n[q.i!]}</span>, n.slice(q.i! + 1))
  else if (q.t === 'italic') parts.push(n.slice(0, q.from), <em key="i">{n.slice(q.from)}</em>)
  else if (q.t === 'flip') parts.push(n.slice(0, q.i), <span key="f" className="flip">{n[q.i!]}</span>, n.slice(q.i! + 1))
  else if (q.t === 'split') parts.push(n.slice(0, q.at), <span key="s" className="light">{n.slice(q.at)}</span>)
  else parts.push(n, <span key="x" style={{ color: acc }}>{q.s}</span>)
  return <span className="wordmark" style={{ color: ink }}>{parts}</span>
}
const lockupSvg = (l: Lockup, dark: boolean, tone: Tone = 'Original') => {
  const w = 44 + l.name.length * 12 + 16
  const mark = toneSvg(l.svg, tone).replace('<svg width="40" height="40"', '<svg x="0" y="4" width="32" height="32"')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="40" viewBox="0 0 ${w} 40">${mark}<text x="42" y="27" font-family="Plus Jakarta Sans, Geist, sans-serif" font-weight="700" font-size="21" letter-spacing="-0.4" fill="${tone !== 'Original' ? toneInk(tone) : dark ? '#fff' : '#101828'}">${l.name}</text></svg>`
}
function Templates({ toggle }: { toggle: React.ReactNode }) {
  const toast = useToast(); const [q, setQ] = useState(''); const [sel, setSel] = useState<M | null>(null); const [lsel, setLsel] = useState<Lockup | null>(null)
  const [tab, setTab] = useState('All'); const [theme, setTheme] = useState<'Light' | 'Dark'>('Light'); const dark = theme === 'Dark'
  const [scale, setScale] = useState(1); const [tone, setTone] = useState<Tone>('Original'); const [boxed, setBoxed] = useState(false); const [font, setFont] = useState('Mixed')
  const dk = dark || tone === 'White'; const tsv = (svg: string) => toneSvg(svg, tone)
  const lock = useMemo(() => LOCKUPS.filter(m => m.name.toLowerCase().includes(q.toLowerCase())), [q])
  const list = useMemo(() => MARKS.filter(m => m.name.toLowerCase().includes(q.toLowerCase())), [q])
  const copySvg = async (m: M, el: Element) => { await copyText(tsv(m.svg)); pop(el, 20); toast(<>Copied <b>{m.name}</b> mark</>) }
  const credit = <a className="credit" href={X_URL} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>Created by <b>@ui_farhan</b></a>
  return (
    <>
      <PageHead chip="Templates" count={LOCKUPS.length + MARKS.length} title="Logo templates" desc="Free placeholder logos for wireframes, decks and mockups. Lockups and gradient marks, with no sign-up and no attribution."
        action={<RequestKey kind="logo" legend="L" />} />
      {toggle}
      <div className="toolbar2">
        <label className="search sm"><Icon name="search" size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search logo templates..." /></label>
      </div>
      <PillTabs items={[['All', LOCKUPS.length + MARKS.length], ['Lockups', LOCKUPS.length], ['Gradient marks', MARKS.length]]} value={tab} onChange={setTab}
        right={`Showing ${(tab !== 'Gradient marks' ? lock.length : 0) + (tab !== 'Lockups' ? list.length : 0)} templates`} />
      {tab !== 'Gradient marks' && <>
        {tab === 'All' && <h3 className="tpl-h">Lockups <span className="mono dim">{lock.length}</span></h3>}
        <div className={`logo-grid lockups ${dk ? 'dark' : ''} ${boxed ? 'boxed' : ''}`} style={{ ['--ls' as string]: scale }}>
          {lock.map((l, k) => (
            <div key={l.name} className="logo-tile" style={{ ['--i' as string]: Math.min(k, 20) }} onClick={() => setLsel(l)}>
              <div className="lt-lockup"><Mark svg={tsv(l.svg)} size={30} /><Wordmark l={l} dark={dk} tone={tone} /></div>
              {credit}
              <div className="lt-actions" onClick={e => e.stopPropagation()}>
                <Tooltip label="Copy SVG"><button onClick={async e => { const el = e.currentTarget; await copyText(lockupSvg(l, dk, tone)); pop(el, 18); toast(<>Copied <b>{l.name}</b></>) }}><Icon name="copy" size={15} /></button></Tooltip>
                <Tooltip label="Download"><button onClick={() => { download(`${l.name.toLowerCase()}.svg`, lockupSvg(l, dk, tone)); toast(<>Downloaded <b>{l.name}</b></>) }}><Icon name="download" size={15} /></button></Tooltip>
                <Tooltip label="Preview"><button onClick={() => setLsel(l)}><Icon name="eye" size={15} /></button></Tooltip>
              </div>
            </div>
          ))}
        </div>
      </>}
      {tab !== 'Lockups' && <>
        {tab === 'All' && <h3 className="tpl-h">Gradient marks <span className="mono dim">{list.length}</span></h3>}
        <div className={`logo-grid ${dk ? 'dark' : ''} ${boxed ? 'boxed' : ''}`} style={{ ['--ls' as string]: scale }}>
          {list.map((m, k) => (
            <div key={m.name} className="logo-tile" style={{ ['--i' as string]: Math.min(k, 20) }} onClick={() => setSel(m)}>
              <div className="lt-lockup"><Mark svg={tsv(m.svg)} size={34} /><span style={{ color: tone !== 'Original' ? toneInk(tone) : undefined, fontFamily: `'${font === 'Mixed' ? FONTS[k % FONTS.length] : font}', Geist, sans-serif` }}>{m.name}</span></div>
              {credit}
              <div className="lt-actions" onClick={e => e.stopPropagation()}>
                <Tooltip label="Copy SVG"><button onClick={e => copySvg(m, e.currentTarget)}><Icon name="copy" size={15} /></button></Tooltip>
                <Tooltip label="Download"><button onClick={() => { download(`${m.name.toLowerCase()}.svg`, tsv(m.svg)); toast(<>Downloaded <b>{m.name}</b></>) }}><Icon name="download" size={15} /></button></Tooltip>
                <Tooltip label="Preview"><button onClick={() => setSel(m)}><Icon name="eye" size={15} /></button></Tooltip>
              </div>
            </div>
          ))}
        </div>
      </>}
      <FloatDock>
        <DockPop id="theme" label="Theme" value={theme} icon={<Icon name={dark ? 'moon' : 'sun'} size={15} color="#fff" />} width={220}>
          <DkRow label="Tiles"><DkChips options={['Light', 'Dark'] as const} value={theme} onChange={setTheme} /></DkRow>
        </DockPop>
        <DockDiv />
        <DockPop id="font" label="Font" value={font} icon={<Icon name="text" size={15} color="#fff" />} width={300}>
          <DkRow label="Mark names"><DkChips options={['Mixed', ...FONTS]} value={font} onChange={setFont} /></DkRow>
        </DockPop>
        <DockDiv />
        <DockStep label="Size" value={`${Math.round(scale * 100)}%`} onMinus={() => setScale(v => SCALES[Math.max(0, SCALES.indexOf(v) - 1)])} onPlus={() => setScale(v => SCALES[Math.min(SCALES.length - 1, SCALES.indexOf(v) + 1)])} />
        <DockDiv />
        <LookPop tone={tone} setTone={setTone} boxed={boxed} setBoxed={setBoxed} />
        <DockDiv /><DockDownloadAll />
      </FloatDock>
      <Modal open={!!lsel} onClose={() => setLsel(null)} label="Lockup" width={560}>
        {lsel && <div className="logo-modal">
          <div className="im-head"><b>{lsel.name}</b><span className="badge-n">Lockup</span><span className="badge-n">SVG</span><CloseButton onClick={() => setLsel(null)} /></div>
          <div className="wl-preview">
            <div className="light"><span className="lt-lockup big"><Mark svg={toneSvg(lsel.svg, tone === 'White' ? 'Black' : tone)} size={40} /><Wordmark l={lsel} dark={false} tone={tone === 'White' ? 'Black' : tone} /></span><span className="mono">Light</span></div>
            <div className="dark"><span className="lt-lockup big"><Mark svg={toneSvg(lsel.svg, tone === 'Black' ? 'White' : tone)} size={40} /><Wordmark l={lsel} dark tone={tone === 'Black' ? 'White' : tone} /></span><span className="mono">Dark</span></div>
          </div>
          <div className="im-foot"><a className="credit-lg" href={X_URL} target="_blank" rel="noreferrer"><XLogo size={12} /> Created by <b>@ui_farhan</b></a><div className="row">
            <Key onClick={async e => { const el = e.currentTarget; await copyText(lockupSvg(lsel, false, tone)); pop(el, 18); toast(<>Copied <b>{lsel.name}</b></>) }}>Copy SVG</Key>
            <Key variant="primary" onClick={e => { download(`${lsel.name.toLowerCase()}.svg`, lockupSvg(lsel, false, tone)); pop(e.currentTarget, 24); toast(<>Downloaded <b>{lsel.name}</b></>) }}>Download</Key>
          </div></div>
        </div>}
      </Modal>
      <Modal open={!!sel} onClose={() => setSel(null)} label="Logo" width={520}>
        {sel && <div className="logo-modal">
          <div className="im-head"><b>{sel.name}</b><span className="badge-n">Mark</span><span className="badge-n">SVG</span><CloseButton onClick={() => setSel(null)} /></div>
          <div className="lm-stage"><div className="lm-mark" key={sel.name}><Mark svg={tsv(sel.svg)} size={120} /></div></div>
          <div className="lm-variants">{['#FFFFFF', '#16171B', '#EEF3FF'].map(bg => <div key={bg} style={{ background: bg }}><Mark svg={tsv(sel.svg)} size={40} /><span style={{ color: bg === '#16171B' ? '#fff' : '#16171B' }}>{sel.name}</span></div>)}</div>
          <div className="im-foot"><a className="credit-lg" href={X_URL} target="_blank" rel="noreferrer"><XLogo size={12} /> Created by <b>@ui_farhan</b></a><div className="row">
            <Key onClick={e => copySvg(sel, e.currentTarget)}>Copy SVG</Key>
            <Key variant="primary" onClick={e => { download(`${sel.name.toLowerCase()}.svg`, tsv(sel.svg)); pop(e.currentTarget, 24); toast(<>Downloaded <b>{sel.name}</b></>) }}>Download</Key>
          </div></div>
        </div>}
      </Modal>
    </>
  )
}
