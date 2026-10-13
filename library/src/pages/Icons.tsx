import type React from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { addIcons, CloseButton, Icon, Modal, Tooltip, copyText, download, iconSvg, useToast, Key, Legend, ICON_STYLES, ICON_MOTIONS, TWO_TONE_DEFAULT, gradCss, type Grad, type IconStyle, type IconMotion } from '../ui'
import { ICONS, ICON_CATS, type Icon as IconT } from '../data/icons'
import { pop } from '../lib/confetti'
import { cleanIconSvg } from '../lib/iconexport'
import { RequestKey, useRequest } from '../request'
import { ColorPicker, PageHead, Select } from '../pagekit'

/** The Stroke control counts from 1 at the default weight: label 1 = a 1.5 px line, so "1" never looks hairline-thin. */
const weightLabel = (stroke: number) => +(stroke - 0.5).toFixed(2)
import { AVATARS, FLAGS, PHOTOS, type FlagT } from '../data/collections'

// this page draws, exports and copies every library icon, so the full set is registered up front
addIcons(ICONS, 'u:')

const SWATCHES = ['#16171B', '#6B6E78', '#2F6BFF', '#7C3AED', '#15803D', '#F59E0B', '#E5484D']
const SHORT: Record<string, string> = { 'Finance & eCommerce': 'Finance', 'Alerts & feedback': 'Alerts', 'Media & devices': 'Media' }

const CAT_ICON: Record<string, string> = { All: 'layers', General: 'u:grid-01', Arrows: 'u:arrow-right', Layout: 'u:layout-left', Users: 'u:user-01', Communication: 'u:message-chat-circle', 'Alerts & feedback': 'u:bell-01',
  'Media & devices': 'u:monitor-01', Files: 'u:file-04', Images: 'u:image-01', Editor: 'u:pencil-01', Charts: 'u:bar-chart-01', 'Finance & eCommerce': 'u:wallet-02', Development: 'u:code-02', Security: 'u:shield-01',
  Time: 'u:clock', 'Maps & travel': 'u:map-01', Weather: 'u:sun', Education: 'u:graduation-hat-01', Shapes: 'u:square' }
const NEW_COUNT = ICONS.filter(i => i.new).length
const DOCK_SWATCHES = ['#16171B', '#A3A5AD', '#2F6BFF', '#7A5AF8', '#15803D', '#F59E0B']
const GRAD_PRESETS: [string, Grad][] = [
  ['Aero', { stops: ['#2F6BFF', '#7A5AF8'], angle: 135 }], ['Sunset', { stops: ['#F97316', '#EC4899'], angle: 135 }],
  ['Mint', { stops: ['#10B981', '#06B6D4'], angle: 135 }], ['Candy', { stops: ['#EC4899', '#8B5CF6'], angle: 135 }],
  ['Ember', { stops: ['#F59E0B', '#E5484D'], angle: 180 }], ['Ocean', { stops: ['#06B6D4', '#2563EB'], angle: 180 }],
  ['Aurora', { stops: ['#22C55E', '#06B6D4', '#7A5AF8'], angle: 135 }], ['Graphite', { stops: ['#16171B', '#8D909A'], angle: 135 }],
]
const sameGrad = (a?: Grad | null, b?: Grad | null) => !!a && !!b && a.angle === b.angle && a.stops.join() === b.stops.join()
/* Two colours, no gradient: Two-tone = two line colours (silhouette + details), Duotone = line + fill */
const LINE2_SWATCHES = ['#2F6BFF', '#7A5AF8', '#0EA5E9', '#15803D', '#F59E0B', '#E5484D']
const FILL_SWATCHES = ['#B9CCFF', '#D9CCFF', '#BFF0D4', '#FFE1A8', '#FFC9C9', '#E5E5E8']
const TWO_PAIRS: [string, string, string][] = [['Ink · Blue', '#16171B', '#2F6BFF'], ['Navy · Orange', '#1E3A8A', '#F97316'], ['Grape · Pink', '#5B21B6', '#EC4899'], ['Forest · Lime', '#166534', '#65A30D'], ['Ink · Amber', '#16171B', '#F59E0B'], ['Blue · Cyan', '#1D4ED8', '#06B6D4']]
const DUO_PAIRS: [string, string, string][] = [['Ink', '#16171B', '#B9CCFF'], ['Ocean', '#1D4ED8', '#BAE6FD'], ['Grape', '#5B21B6', '#F0ABFC'], ['Forest', '#166534', '#BBF7D0'], ['Ember', '#9A3412', '#FDE68A'], ['Rose', '#9F1239', '#FECDD3']]
/** the second colour each style takes (Duotone's fill is "auto" — the line colour at 20 % — until one is picked) */
const secondOf = (st: IconStyle, line2: string, fill: string | null) => st === 'Two-tone' ? line2 : st === 'Duotone' ? fill ?? undefined : undefined
const SPEEDS = [['Slow', 2.6], ['Normal', 1.6], ['Fast', 1]] as const
const motionNote: Record<string, string> = { Draw: 'Traces every line, then the fills', Pulse: 'Breathes in and out', Bounce: 'Hops and settles', Wiggle: 'A quick shake', Float: 'Drifts gently', Pop: 'A springy tap' }

type Mode = 'icons' | 'avatars' | 'flags'
// Pixel, 3D and Glass are drawn but not released yet
const LOCKED = new Set<IconStyle>(['Pixel', '3D', 'Glass'])
const SOON = 'Coming soon'
const avatarSvg = (id: string, size = 64) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">${AVATARS.find(a => a.id === id)!.svg}</svg>`
type FlagType = 'Rectangle' | 'Radius' | 'Square' | 'Circle'
const FLAG_TYPES: FlagType[] = ['Rectangle', 'Radius', 'Square', 'Circle']
// one artwork per country (from the Figma flag set); the four shapes are crops + clips of it
const flagBox = (f: FlagT, t: FlagType) => t === 'Rectangle' || t === 'Radius' ? [f.x, f.y, 21, 15] : [f.x + 3, f.y, 15, 15]
const flagMarkup = (f: FlagT, t: FlagType, uid: string) => {
  const [x, y, w, h] = flagBox(f, t)
  const shape = t === 'Circle' ? `<circle cx="${x + 7.5}" cy="${y + 7.5}" r="7.5"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${t === 'Radius' ? 2 : t === 'Square' ? 1 : 0}"/>`
  const edge = shape.replace('/>', ' fill="none" stroke="#16171B" stroke-opacity=".12" stroke-width=".5"/>')
  return { vb: `${x} ${y} ${w} ${h}`, w, h, html: `<defs><clipPath id="${uid}">${shape}</clipPath></defs><g clip-path="url(#${uid})">${f.svg}</g>${edge}` }
}
const flagSvg = (code: string, t: FlagType = 'Radius', size = 64) => {
  const f = FLAGS.find(c => c.code === code)!; const m = flagMarkup(f, t, `fl-${code}`)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * m.h / m.w)}" viewBox="${m.vb}">${m.html}</svg>`
}
function Coll({ html, size, vb = 24, h }: { html: string; size: number; vb?: number | string; h?: number }) {
  return <svg width={size} height={h ?? size} viewBox={typeof vb === 'string' ? vb : `0 0 ${vb} ${vb}`} aria-hidden dangerouslySetInnerHTML={{ __html: html }} />
}

export default function IconsPage({ initialQuery = '' }: { initialQuery?: string }) {
  const toast = useToast()
  const request = useRequest(); const [mode, setMode] = useState<Mode>('icons')
  const [q, setQ] = useState(initialQuery); const [cat, setCat] = useState('All'); const [sort, setSort] = useState<'Popular' | 'A–Z'>('Popular')
  const [stroke, setStroke] = useState(1.5); const [color, setColor] = useState('#16171B'); const [size, setSize] = useState(24)
  const [grad, setGrad] = useState<Grad>(GRAD_PRESETS[0][1]); const [useGrad, setUseGrad] = useState(false)
  const [menu, setMenu] = useState<'' | 'sort' | 'style' | 'color' | 'motion' | 'dl'>(''); const [paintTab, setPaintTab] = useState<'solid' | 'grad' | 'second'>('solid'); const [sel, setSel] = useState<IconT | null>(null); const [iconStyle, setIconStyle] = useState<IconStyle>('Aero')
  const [color2, setColor2] = useState(TWO_TONE_DEFAULT); const [duoFill, setDuoFill] = useState<string | null>(null)
  const two = iconStyle === 'Two-tone', duo = iconStyle === 'Duotone', pair = two || duo
  const g = useGrad && !pair ? grad : undefined // the two-colour styles take two solid colours, never a gradient
  const second = secondOf(iconStyle, color2, duoFill)
  const tab = pair ? (paintTab === 'grad' ? 'solid' : paintTab) : (paintTab === 'second' ? 'solid' : paintTab)
  const [motion, setMotion] = useState<IconMotion>({ kind: 'None', speed: 1.6 }); const [play, setPlay] = useState<'Always' | 'Hover'>('Always')
  const moving = motion.kind !== 'None'
  // staggered start so a grid of moving icons reads as a wave, not a flash
  const motionAt = (k: number) => moving ? { ...motion, delay: (k % 12) * .07 } : undefined
  const [dockOn, setDockOn] = useState(true)
  const search = useRef<HTMLInputElement>(null)
  useEffect(() => setQ(initialQuery), [initialQuery])
  useEffect(() => { const c = () => setMenu(''); addEventListener('click', c); return () => removeEventListener('click', c) }, [])
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') { e.preventDefault(); search.current?.focus() } }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [])
  // the dock floats over the icon area and tucks away when the footer arrives
  useEffect(() => { const f = document.querySelector('.footer'); if (!f) return; const io = new IntersectionObserver(([e]) => setDockOn(!e.isIntersecting), { rootMargin: '0px 0px -40px 0px' }); io.observe(f); return () => io.disconnect() }, [])
  const counts = useMemo(() => Object.fromEntries(ICON_CATS.map(c => [c, ICONS.filter(i => i.cat === c).length])), [])
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    let list = ICONS.filter(i => (cat === 'All' || i.cat === cat) && (!s || i.name.includes(s)))
    if (sort === 'A–Z') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [q, cat, sort])
  const groups = useMemo(() => (cat === 'All' && sort === 'Popular' && !q) ? ICON_CATS.map(c => [c, filtered.filter(i => i.cat === c)] as const).filter(g => g[1].length) : [[cat === 'All' ? (q ? `Results for “${q}”` : 'All icons') : cat, filtered] as const], [filtered, cat, sort, q])
  // sliding highlight in the sidebar
  const navRef = useRef<HTMLDivElement>(null); const [hl, setHl] = useState({ y: 0, h: 0 })
  // sidebar edges dissolve (fade + blur) while there is more to scroll in that direction
  const sideRef = useRef<HTMLElement>(null); const [edge, setEdge] = useState({ top: false, bottom: false })
  useEffect(() => {
    const el = sideRef.current; if (!el) return
    const upd = () => setEdge({ top: el.scrollTop > 2, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 2 })
    upd(); el.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd)
    const ro = new ResizeObserver(upd); ro.observe(el)
    return () => { el.removeEventListener('scroll', upd); removeEventListener('resize', upd); ro.disconnect() }
  }, [])
  useLayoutEffect(() => { const el = navRef.current?.querySelector('.side-item.on') as HTMLElement | null; if (el) setHl({ y: el.offsetTop, h: el.offsetHeight }) }, [cat])
  // Copy / Download: clean SVG (no masks), one vector named after the icon
  const svgOf = (i: IconT, px: number) => cleanIconSvg('u:' + i.name, { stroke, color, size: px, variant: iconStyle, grad: g, color2: second, motion: moving ? motion : undefined })
  const copyIcon = async (i: IconT, el: Element) => { await copyText(await svgOf(i, 24), i.name); pop(el, 18); toast(<>Copied <b>{i.name}</b> · {iconStyle}{g ? ' · gradient' : ''}{moving ? ` · ${motion.kind}` : ''}</>) }
  const downloadSet = (el: Element) => {
    const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${filtered.map(i => `<symbol id="${i.name}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${i.body}</symbol>`).join('')}</svg>`
    download('aerobox-icons.svg', sprite); pop(el, 44); toast(<>Downloaded <b>{filtered.length} icons</b> as a sprite</>)
  }
  const pickCat = (c: string) => { setCat(c); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return (
    <div className="page icons-page">
      <PageHead chip="Icons" count={ICONS.length} fresh={NEW_COUNT} title="Icons" desc="Aero Icons: clean line icons for products, interfaces and design systems, in five styles. Every icon carries the Aero character, from its break in the line to its corners."
        action={<RequestKey kind="icon" legend="I" />} />

      <div className="icons-layout">
        <aside ref={sideRef} className={`side ${edge.top ? 'fade-top' : ''} ${edge.bottom ? 'fade-bottom' : ''}`}>
          <span className="side-veil top" aria-hidden />
          <div className="side-group">
            <span className="side-label mono">Style</span>
            <div className="side-styles">
              {ICON_STYLES.map(st => LOCKED.has(st)
                ? <Tooltip key={st} label={SOON}><button className="style-card locked" aria-disabled onClick={e => { pop(e.currentTarget, 12); toast(SOON) }}>
                    <span className="style-prev"><Icon name="lock" size={14} stroke={1.8} /></span>{st}</button></Tooltip>
                : <button key={st} className={`style-card ${mode === 'icons' && iconStyle === st ? 'on' : ''}`} onClick={() => { setMode('icons'); setIconStyle(st) }}>
                    <span className="style-prev"><Icon name="layers" size={16} stroke={stroke} variant={st} /></span>{st}
                  </button>)}
            </div>
          </div>
          <div className="side-group">
            <span className="side-label mono">Collections</span>
            <div className="side-styles">
              {(['avatars', 'flags'] as const).map(m => (
                <button key={m} className={`style-card ${mode === m ? 'on' : ''}`} onClick={() => setMode(v => v === m ? 'icons' : m)}>
                  <span className="style-prev">{m === 'avatars' ? <Coll html={AVATARS[8].svg} size={20} vb={64} /> : <FlagIcon f={FLAGS.find(f => f.code === 'indonesia')!} t="Radius" size={18} />}</span>
                  {m === 'avatars' ? 'Avatars' : 'Flags'}<span className="sc-n mono">{m === 'avatars' ? AVATARS.length + PHOTOS.length : FLAGS.length}</span>
                </button>))}
            </div>
          </div>
          <div className={`side-group ${mode !== 'icons' ? 'is-off' : ''}`}>
            <span className="side-label mono">Categories{mode !== 'icons' && <i> · icons only</i>}</span>
            <nav className="side-nav" ref={navRef}>
              <span className="side-hl" style={{ transform: `translateY(${hl.y}px)`, height: hl.h }} />
              {['All', ...ICON_CATS].map(c => (
                <button key={c} className={`side-item ${cat === c ? 'on' : ''}`} onClick={() => pickCat(c)}>
                  <Icon name={CAT_ICON[c]} size={16} /><span className="si-label">{SHORT[c] ?? c}</span><span className="si-count mono">{c === 'All' ? ICONS.length : counts[c]}</span>
                </button>))}
            </nav>
          </div>
          <div className="side-card">
            <b>Missing an icon?</b><span>Request one — new icons ship every week.</span>
            <Key size="sm" onClick={e => { pop(e.currentTarget, 18); request('icon') }}>Request an icon</Key>
          </div>
          <span className="side-veil bottom" aria-hidden />
        </aside>

        <div className="icons-main">
          <div className="main-bar">
            <label className="search"><Icon name="search" size={20} /><input ref={search} value={q} onChange={e => setQ(e.target.value)} placeholder="Search icons" /><kbd>/</kbd></label>
            <div className="dd-wrap dd-sort" onClick={e => e.stopPropagation()}>
              <Key onClick={() => setMenu(m => m === 'sort' ? '' : 'sort')} aria-label={`Sort: ${sort}`}><span className="dim">Sort</span> <span className="sort-v">{sort}</span> <span className="sort-ic"><Icon name="arrow-down" size={14} /></span><span className="sort-ic2"><Icon name="sort" size={18} /></span></Key>
              <div className={`popover right ${menu === 'sort' ? 'on' : ''}`}>{(['Popular', 'A–Z'] as const).map(s => <button key={s} className={`pop-item ${sort === s ? 'on' : ''}`} onClick={() => { setSort(s); setMenu('') }}>{s}</button>)}</div>
            </div>
            {/* Download all: pick the style to export — visible, but locked until the full pack ships */}
            <div className="dd-wrap dd-dl" onClick={e => e.stopPropagation()}>
              <Key onClick={() => setMenu(m => m === 'dl' ? '' : 'dl')} aria-expanded={menu === 'dl'} className="dl-all"><Icon name="lock" size={14} /><span className="dl-all-t">Download all</span><Icon name="arrow-down" size={14} /></Key>
              <div className={`popover right dl-pop ${menu === 'dl' ? 'on' : ''}`}>
                <div className="dl-pop-head"><b>Download all icons</b><span className="soon">Coming soon</span></div>
                {ICON_STYLES.filter(st => !LOCKED.has(st)).map(st => (
                  <button key={st} className="pop-item dl-item" aria-disabled onClick={e => { pop(e.currentTarget, 10); toast(<>Download all · <b>{st}</b> is coming soon</>) }}>
                    <span className="pi-row"><Icon name="u:folder" size={18} variant={st} color="#16171B" color2={secondOf(st, color2, duoFill)} />{st}</span>
                    <span className="dl-meta mono">{ICONS.length} SVG</span><Icon name="lock" size={13} />
                  </button>))}
                <p className="dl-note">Every icon in the chosen style as SVG, plus a sprite. Unlocks soon.</p>
              </div>
            </div>
          </div>
          {mode !== 'icons' && <CollectionGrid key={mode} kind={mode} q={q} size={size} />}
          {mode === 'icons' && groups.map(([title, items]) => (
            <section key={title} className="icon-section">
              <h2>{title} <span className="mono dim">{items.length}</span></h2>
              <div className={`icon-grid ${moving ? `is-moving play-${play.toLowerCase()}` : ''}`}>
                {items.map((i, k) => (
                  <div key={i.name} className="tile" style={{ ['--i' as string]: Math.min(k, 24) }} onClick={() => setSel(i)}>
                    <span className="tile-ic"><Icon name={'u:' + i.name} size={size} stroke={stroke} color={color} color2={second} variant={iconStyle} grad={g} motion={motionAt(k)} /></span>
                    <span className="tile-name">{i.name}</span>
                    <span className="tile-actions" onClick={e => e.stopPropagation()}>
                      <Tooltip label="Copy SVG"><button onClick={e => copyIcon(i, e.currentTarget)}><Icon name="copy" size={14} /></button></Tooltip>
                      <Tooltip label="Download"><button onClick={async () => { download(`${i.name}.svg`, await svgOf(i, size)); toast(<>Downloaded <b>{i.name}.svg</b>{moving ? ' · animated' : ''}</>) }}><Icon name="download" size={14} /></button></Tooltip>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {mode === 'icons' && filtered.length === 0 && <div className="empty"><Icon name="search" size={28} /><b>No icons match “{q}”</b><span>Try “arrow”, “chart” or “user”.</span></div>}
        </div>
      </div>

      <div className={`dock dock-icons ${dockOn ? 'on' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="dd-wrap dc-style">
          <button className={`dock-style ${menu === 'style' ? 'open' : ''}`} onClick={() => setMenu(m => m === 'style' ? '' : 'style')}><span className="dl">Style</span>{iconStyle}<Icon name="chevron-down" size={13} /></button>
          <div className={`popover up dark ${menu === 'style' ? 'on' : ''}`}>{ICON_STYLES.map(st => LOCKED.has(st)
            ? <button key={st} className="pop-item" disabled onClick={() => toast(SOON)}><span className="pi-row"><Icon name="layers" size={16} color="#8D909A" />{st}</span><Icon name="lock" size={13} color="#8D909A" /></button>
            : <button key={st} className={`pop-item ${iconStyle === st ? 'on' : ''}`} onClick={() => { setIconStyle(st); setMode('icons'); setMenu('') }}><span className="pi-row"><Icon name="layers" size={16} variant={st} color="#fff" />{st}</span></button>)}</div>
        </div>
        <span className="dock-div" />
        <div className="dock-step dc-size"><span className="dl">Size</span><button onClick={() => setSize(v => Math.max(16, v - 4))} aria-label="Smaller">−</button><b className="mono">{size}</b><button onClick={() => setSize(v => Math.min(36, v + 4))} aria-label="Bigger">+</button></div>
        <div className="dock-step dc-stroke"><span className="dl">Stroke</span><button onClick={() => setStroke(v => Math.max(1, +(v - 0.25).toFixed(2)))} aria-label="Thinner">−</button><b className="mono">{weightLabel(stroke)}</b><button onClick={() => setStroke(v => Math.min(2.5, +(v + 0.25).toFixed(2)))} aria-label="Thicker">+</button></div>
        <span className="dock-div" />
        {/* one paint control: Solid / Gradient — or, for the two-colour styles, their two colours */}
        <div className="dd-wrap dc-color">
          <button className={`dock-gbtn dock-paint ${menu === 'color' ? 'open' : ''}`} onClick={() => { setPaintTab(g ? 'grad' : 'solid'); setMenu(m => m === 'color' ? '' : 'color') }} aria-expanded={menu === 'color'}>
            <i className="paint-chip" style={{ background: g ? gradCss(grad) : color }}>{pair && <em style={{ background: second ?? color, opacity: second ? 1 : .35 }} />}</i><span className="dl">Color</span><Icon name="chevron-down" size={13} /></button>
          <div className={`popover up dark paint-pop ${menu === 'color' ? 'on' : ''}`}>
            <div className="paint-tabs" role="tablist">{(pair ? ['solid', 'second'] as const : ['solid', 'grad'] as const).map(t =>
              <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => { setPaintTab(t); if (t === 'grad') setUseGrad(true); if (t === 'solid' && !pair) setUseGrad(false) }}>
                {t === 'grad' ? 'Gradient' : t === 'solid' ? (two ? 'Line 1' : duo ? 'Line' : 'Solid') : two ? 'Line 2' : 'Fill'}</button>)}</div>
            {pair && <>
              <div className="ge-label"><span className="dl">Pairs</span></div>
              <div className="tone-pairs">{(two ? TWO_PAIRS : DUO_PAIRS).map(([n, a, b]) => {
                const on = a === color && (two ? b === color2 : b === duoFill)
                return <Tooltip key={n} label={n}><button className={on ? 'on' : ''} onClick={() => { setColor(a); if (two) setColor2(b); else setDuoFill(b) }} aria-label={`${n} pair`}>
                  <Icon name="u:image-01" size={22} stroke={1.6} color={a} color2={b} variant={iconStyle} /></button></Tooltip>
              })}</div>
            </>}
            {tab === 'solid' && <>
              <div className="tone-sw">{DOCK_SWATCHES.map(c => <button key={c} className={!g && c === color ? 'on' : ''} style={{ background: c }} onClick={() => { setColor(c); if (!pair) setUseGrad(false) }} aria-label={c} />)}</div>
              {menu === 'color' && <ColorPicker value={color} onChange={c => { setColor(c); if (!pair) setUseGrad(false) }} />}
            </>}
            {tab === 'grad' && <GradEditor value={grad} onChange={v => { setGrad(v); setUseGrad(true) }} />}
            {tab === 'second' && two && <>
              <div className="tone-sw">{LINE2_SWATCHES.map(c => <button key={c} className={c === color2 ? 'on' : ''} style={{ background: c }} onClick={() => setColor2(c)} aria-label={c} />)}</div>
              {menu === 'color' && <ColorPicker value={color2} onChange={setColor2} />}
            </>}
            {tab === 'second' && duo && <>
              <div className="tone-sw"><button className={`auto ${duoFill === null ? 'on' : ''}`} onClick={() => setDuoFill(null)} aria-label="Auto fill" title="Auto: line colour at 20 %" style={{ background: `color-mix(in srgb, ${color} 20%, #fff)` }} />
                {FILL_SWATCHES.slice(0, 5).map(c => <button key={c} className={c === duoFill ? 'on' : ''} style={{ background: c }} onClick={() => setDuoFill(c)} aria-label={c} />)}</div>
              {menu === 'color' && <ColorPicker value={duoFill ?? '#B9CCFF'} onChange={setDuoFill} />}
            </>}
          </div>
        </div>
        <div className="dd-wrap dc-motion">
          <button className={`dock-gbtn ${menu === 'motion' ? 'open' : ''}`} onClick={() => setMenu(m => m === 'motion' ? '' : 'motion')} aria-expanded={menu === 'motion'}>
            <Icon name="play" size={13} color="#fff" /><span className="dl">Motion</span><b>{moving ? motion.kind : 'Off'}</b><Icon name="chevron-down" size={13} /></button>
          <div className={`popover up dark motion-pop ${menu === 'motion' ? 'on' : ''}`}>
            <div className="motion-grid">{ICON_MOTIONS.map(k => (
              <button key={k} className={motion.kind === k ? 'on' : ''} onClick={() => setMotion(m => ({ ...m, kind: k }))}>
                <span className="mg-prev"><Icon name="u:heart" size={20} stroke={1.6} color={motion.kind === k ? '#16171B' : '#fff'} color2={motion.kind === k ? '#B9CCFF' : '#5B5E68'} variant={iconStyle} motion={k === 'None' ? undefined : { kind: k, speed: motion.speed }} /></span>
                <span>{k === 'None' ? 'Off' : k}</span></button>))}</div>
            {moving && <p className="dk-note">{motionNote[motion.kind]}. Copy and Download keep the animation (CSS inside the SVG).</p>}
            <div className="dk-row"><span className="dk-label">Speed</span><div className="dk-chips">{SPEEDS.map(([n, v]) => <button key={n} className={motion.speed === v ? 'on' : ''} onClick={() => setMotion(m => ({ ...m, speed: v }))}>{n}</button>)}</div></div>
            <div className="dk-row"><span className="dk-label">Play</span><div className="dk-chips">{(['Always', 'Hover'] as const).map(p => <button key={p} className={play === p ? 'on' : ''} onClick={() => setPlay(p)}>{p}</button>)}</div></div>
          </div>
        </div>
      </div>
      <IconModal icon={sel} onClose={() => setSel(null)} stroke={stroke} color={color} color2={second} grad={g} iconStyle={iconStyle} motion={moving ? motion : undefined} />
    </div>
  )
}

function FlagIcon({ f, t, size }: { f: FlagT; t: FlagType; size: number }) {
  const m = flagMarkup(f, t, `fi-${f.code}-${t}-${size}`)
  return <Coll html={m.html} vb={m.vb} size={size} h={Math.round(size * m.h / m.w)} />
}
const AV_FILTERS: [string, string[]][] = [['Gender', ['All', 'Male', 'Female']], ['Age', ['All', 'Kid', 'Teen', 'Adult', 'Senior']], ['Outfit', ['All', 'Casual', 'Formal']]]
function CollectionGrid({ kind, q, size }: { kind: 'avatars' | 'flags'; q: string; size: number }) {
  const toast = useToast(); const [sel, setSel] = useState<string | null>(null)
  const [flt, setFlt] = useState<Record<string, string>>({ Gender: 'All', Age: 'All', Outfit: 'All' })
  const [src, setSrc] = useState<'Illustrated' | 'Photo'>('Illustrated'); const [ft, setFt] = useState<FlagType>('Radius')
  const av = kind === 'avatars', photo = av && src === 'Photo'
  type It = { id: string; name: string; html?: string; img?: string; flag?: FlagT; tags: Record<string, string> }
  const tagsOf = (a: { gender: string; age: string; outfit: string }) => ({ Gender: a.gender === 'male' ? 'Male' : 'Female', Age: a.age, Outfit: a.outfit })
  const all: It[] = !av ? FLAGS.map(f => ({ id: f.code, name: f.name, flag: f, tags: {} })) : photo ? PHOTOS.map(p => ({ id: p.id, name: p.name, img: p.src, tags: tagsOf(p) })) : AVATARS.map(a => ({ id: a.id, name: a.name, html: a.svg, tags: tagsOf(a) }))
  const items = all.filter(it => it.name.toLowerCase().includes(q.trim().toLowerCase()) && (!av || Object.entries(flt).every(([k, v]) => v === 'All' || it.tags[k] === v)))
  const svgOf = (id: string, px?: number) => av ? avatarSvg(id, px ?? 64) : flagSvg(id, ft, px ?? 64)
  const file = (id: string) => photo ? `avatar-${id}.${PHOTOS.find(p => p.id === id)?.src.split('.').pop() ?? 'jpg'}` : `${av ? 'avatar' : 'flag'}-${id}${av ? '' : '-' + ft.toLowerCase()}.svg`
  const save = async (it: It) => {
    if (it.img) { const b = await (await fetch(it.img)).blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = file(it.id); a.click() }
    else download(file(it.id), svgOf(it.id, av ? 128 : 96))
    toast(<>Downloaded <b>{file(it.id)}</b></>)
  }
  const copy = async (it: It, el: Element) => { await copyText(it.img ? location.origin + it.img : svgOf(it.id)); pop(el, 18); toast(<>Copied <b>{it.name}</b>{it.img ? ' image link' : ''}</>) }
  const view = (it: It, px: number) => it.flag ? <FlagIcon f={it.flag} t={ft} size={px} /> : it.img ? <img src={it.img} width={px} height={px} className="av-photo" alt="" /> : <Coll html={it.html!} size={px} vb={64} />
  const cur = items.find(i => i.id === sel)
  const tileSize = av ? Math.round(size * 2.6) : Math.round(size * 1.6)
  return (
    <section className="icon-section">
      <h2>{av ? 'Avatars' : 'Flags'} <span className="mono dim">{items.length}</span></h2>
      <p className="coll-note">{av ? 'People of every age in casual and formal outfits, as illustrations or real photos.' : `${FLAGS.length} country flags in four shapes, ready for language and region pickers.`}</p>
      <div className="av-filters">
        {av ? <>
          <div className="av-filter"><span className="dl">Type</span>{(['Illustrated', 'Photo'] as const).map(o => <button key={o} className={`chip ${src === o ? 'on' : ''}`} onClick={() => setSrc(o)}>{o}</button>)}</div>
          {AV_FILTERS.map(([k, opts]) => (
            <div key={k} className="av-filter"><span className="dl">{k}</span>{opts.map(o => <button key={o} className={`chip ${flt[k] === o ? 'on' : ''}`} onClick={() => setFlt(f => ({ ...f, [k]: o }))}>{o}</button>)}</div>))}
        </> : <div className="av-filter"><span className="dl">Shape</span>{FLAG_TYPES.map(o => <button key={o} className={`chip ${ft === o ? 'on' : ''}`} onClick={() => setFt(o)}><FlagIcon f={FLAGS.find(f => f.code === 'indonesia')!} t={o} size={16} />{o}</button>)}</div>}
      </div>
      <div className={`icon-grid ${av ? 'av-grid' : 'flag-grid'}`}>
        {items.map((it, k) => (
          <div key={it.id} className="tile" style={{ ['--i' as string]: Math.min(k, 24) }} onClick={() => setSel(it.id)}>
            <span className="tile-ic">{view(it, tileSize)}</span>
            <span className="tile-name">{it.name}</span>
            <span className="tile-actions" onClick={e => e.stopPropagation()}>
              <Tooltip label={it.img ? 'Copy link' : 'Copy SVG'}><button onClick={e => copy(it, e.currentTarget)}><Icon name="copy" size={14} /></button></Tooltip>
              <Tooltip label="Download"><button onClick={() => save(it)}><Icon name="download" size={14} /></button></Tooltip>
            </span>
          </div>))}
      </div>
      {items.length === 0 && <div className="empty"><Icon name="search" size={28} /><b>Nothing matches these filters</b></div>}
      <Modal open={!!cur} onClose={() => setSel(null)} label={cur?.name ?? ''} width={460}>
        {cur && <div className="icon-modal">
          <div className="im-head"><b>{cur.name}</b><span className="badge-n">{av ? (photo ? 'Photo' : 'Avatar') : `Flag · ${ft}`}</span>{av && <span className="badge-n">{cur.tags.Age} · {cur.tags.Outfit}</span>}<CloseButton onClick={() => setSel(null)} /></div>
          <div className="im-preview"><div className="im-big">{view(cur, av ? 132 : 128)}</div>
            <div className="im-sizes">{(av ? [24, 32, 48, 64] : [16, 24, 32, 48]).map(v => <span key={v} className="coll-size">{view(cur, v)}<span className="mono">{v}</span></span>)}</div></div>
          <div className="im-foot"><span className="mono dim">{photo ? 'JPG · 256px' : 'SVG'}</span><div className="row">
            <Key onClick={() => save(cur)}><Icon name="download" size={15} /> Download</Key>
            <Key variant="primary" onClick={e => copy(cur, e.currentTarget)}><Icon name="copy" size={15} /> {cur.img ? 'Copy link' : 'Copy SVG'}</Key>
          </div></div>
        </div>}
      </Modal>
    </section>
  )
}

function IconModal({ icon, onClose, stroke: s0, color: c0, color2: f0, grad: g0, iconStyle, motion: m0 }: { icon: IconT | null; onClose: () => void; stroke: number; color: string; color2?: string; grad?: Grad; iconStyle: IconStyle; motion?: IconMotion }) {
  const toast = useToast()
  const two = iconStyle === 'Two-tone', duo = iconStyle === 'Duotone', pair = two || duo
  const [size, setSize] = useState(24); const [stroke, setStroke] = useState(s0); const [color, setColor] = useState(c0); const [grad, setGrad] = useState<Grad | undefined>(g0); const [tab, setTab] = useState<'SVG' | 'React' | 'Vue'>('SVG')
  const [color2, setColor2] = useState<string | undefined>(f0); const [motion, setMotion] = useState<IconMotion>(m0 ?? { kind: 'None', speed: 1.6 })
  const last = useRef<IconT | null>(null); if (icon) last.current = icon
  const i = icon ?? last.current
  useEffect(() => { if (icon) { setStroke(s0); setColor(c0); setColor2(f0); setGrad(pair ? undefined : g0); setMotion(m0 ?? { kind: 'None', speed: 1.6 }); setSize(24) } }, [icon, s0, c0, f0, g0, m0, pair])
  const mv = motion.kind !== 'None' ? motion : undefined
  // the code view shows exactly what Copy SVG gives: clean geometry, one vector named after the icon
  const opts = { stroke, color, size, variant: iconStyle, grad: pair ? undefined : grad, color2, motion: mv }
  const svg = (px: number) => cleanIconSvg('u:' + (i?.name ?? ''), { ...opts, size: px })
  const [clean, setClean] = useState('')
  useEffect(() => { let live = true; if (i) cleanIconSvg('u:' + i.name, opts).then(v => { if (live) setClean(v) }); return () => { live = false } }, [i?.name, stroke, color, size, iconStyle, grad, color2, mv?.kind, mv?.speed]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!i) return null
  const comp = i.name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
  const paintProp = (vue: boolean) => (grad && !pair ? `${vue ? ':gradient="' : 'gradient={'}{ stops: [${grad.stops.map(c => `'${c}'`).join(', ')}], angle: ${grad.angle} }${vue ? '"' : '}'}` : `color="${color}"`) +
    (two ? ` color2="${color2 ?? TWO_TONE_DEFAULT}"` : duo && color2 ? ` fill="${color2}"` : '') + (mv ? ` motion="${mv.kind.toLowerCase()}"` : '')
  const code = tab === 'SVG' ? clean : tab === 'React' ? `import { ${comp} } from "aerobox-icons"\n\n<${comp} size={${size}} strokeWidth={${stroke}} ${paintProp(false)} />` : `<script setup>\nimport { ${comp} } from "aerobox-icons/vue"\n</script>\n\n<${comp} :size="${size}" :stroke-width="${stroke}" ${paintProp(true)} />`
  const copy = async (what: string, txt: string | Promise<string>, el: Element) => { await copyText(await txt, i.name); pop(el, 22); toast(<>Copied <b>{i.name}</b> as {what}</>) }
  const g = pair ? undefined : grad
  return (
    <Modal open={!!icon} onClose={onClose} label={`Icon ${i.name}`} width={600}>
      <div className="icon-modal">
        <div className="im-head"><b>{i.name}</b><span className="badge-n">{i.cat}</span><span className="badge-n">{size}px</span><span className="badge-n">{iconStyle}</span>{mv && <span className="badge-n">{mv.kind}</span>}<CloseButton onClick={onClose} /></div>
        <div className="im-preview">
          <div className="im-big" key={i.name + motion.kind + motion.speed}><Icon name={'u:' + i.name} size={96} stroke={stroke} color={color} color2={color2} variant={iconStyle} grad={g} motion={mv} /></div>
          <div className="im-sizes">{[16, 20, 24, 32, 48].map(v => <button key={v} className={v === size ? 'on' : ''} onClick={() => setSize(v)}><Icon name={'u:' + i.name} size={v} stroke={stroke} color={color} color2={color2} variant={iconStyle} grad={g} /><span className="mono">{v}</span></button>)}</div>
        </div>
        {/* compact toolbar: size · stroke · motion · speed on one row, colours on the next */}
        <div className="im-controls">
          <div className="stepper"><span>Size</span><button onClick={() => setSize(v => Math.max(12, v - 4))} aria-label="Smaller">−</button><b className="mono">{size}</b><button onClick={() => setSize(v => Math.min(64, v + 4))} aria-label="Bigger">+</button></div>
          <div className="stepper"><span>Stroke</span><button onClick={() => setStroke(v => Math.max(1, +(v - 0.25).toFixed(2)))} aria-label="Thinner">−</button><b className="mono">{weightLabel(stroke)}</b><button onClick={() => setStroke(v => Math.min(3, +(v + 0.25).toFixed(2)))} aria-label="Thicker">+</button></div>
          <Select label="Motion" value={motion.kind} options={ICON_MOTIONS} onChange={k => setMotion(m => ({ ...m, kind: k }))} render={k => k === 'None' ? 'Off' : k} />
          {mv && <Select label="Speed" value={SPEEDS.find(x => x[1] === motion.speed)?.[0] ?? 'Normal'} options={SPEEDS.map(x => x[0])} onChange={n => setMotion(m => ({ ...m, speed: SPEEDS.find(x => x[0] === n)![1] }))} />}
        </div>
        <div className="im-paint">
          <div className="swatches">{pair && <span className="dl">{two ? 'Line 1' : 'Line'}</span>}{SWATCHES.map(c => <button key={c} className={`sw-btn ${!g && c === color ? 'on' : ''}`} style={{ background: c }} onClick={() => { setColor(c); setGrad(undefined) }} aria-label={c} />)}
            {!pair && <><span className="sw-div" />
            {(g0 && !GRAD_PRESETS.some(p => sameGrad(p[1], g0)) ? [['Custom', g0] as [string, Grad], ...GRAD_PRESETS.slice(0, 3)] : GRAD_PRESETS.slice(0, 4)).map(([n, p]) =>
              <Tooltip key={n} label={n}><button className={`sw-btn ${sameGrad(grad, p) ? 'on' : ''}`} style={{ background: gradCss(p) }} onClick={() => setGrad(p)} aria-label={`${n} gradient`} /></Tooltip>)}</>}</div>
          {pair && <div className="swatches fill-row"><span className="dl">{two ? 'Line 2' : 'Fill'}</span>
            {duo && <Tooltip label="Auto: line colour at 20 %"><button className={`sw-btn sw-auto ${!color2 ? 'on' : ''}`} style={{ background: `color-mix(in srgb, ${color} 20%, #fff)` }} onClick={() => setColor2(undefined)} aria-label="Auto fill" /></Tooltip>}
            {(two ? LINE2_SWATCHES : FILL_SWATCHES).map(c => <button key={c} className={`sw-btn ${c === color2 ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor2(c)} aria-label={`${two ? 'Line 2' : 'Fill'} ${c}`} />)}
            <label className="sw-btn sw-custom"><input type="color" value={(color2 ?? '#B9CCFF').toLowerCase()} onChange={e => setColor2(e.target.value.toUpperCase())} aria-label="Custom colour" /></label></div>}
        </div>
        <div className="code">
          <div className="code-tabs">{(['SVG', 'React', 'Vue'] as const).map(t => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
            <Tooltip label="Copy snippet"><button className="code-copy" onClick={e => copy(tab, code, e.currentTarget)}><Icon name="copy" size={14} /></button></Tooltip></div>
          <pre>{code}</pre>
        </div>
        <div className="im-foot">
          <span className="mono dim esc-hint"><kbd>esc</kbd> to close</span>
          <div className="row">
            <Key onClick={async () => { download(`${i.name}.svg`, await svg(size)); toast(<>Downloaded <b>{i.name}.svg</b>{mv ? ' · animated' : ''}</>) }}>Download</Key>
            <Key onClick={e => copy('JSX', `<${comp} size={${size}} strokeWidth={${stroke}} ${paintProp(false)} />`, e.currentTarget)}>Copy JSX</Key>
            <Key variant="primary" onClick={e => copy('SVG', svg(size), e.currentTarget)}>Copy SVG <kbd>↵</kbd></Key>
          </div>
        </div>
      </div>
    </Modal>
  )
}

/* gradient editor in the dock: presets, 2–3 colour stops, angle dial + slider */
const HEX = /^#[0-9A-F]{6}$/i
const mix = (a: string, b: string) => '#' + [1, 3, 5].map(i => Math.round((parseInt(a.slice(i, i + 2), 16) + parseInt(b.slice(i, i + 2), 16)) / 2).toString(16).padStart(2, '0')).join('').toUpperCase()
function StopRow({ label, value, onChange, onRemove }: { label: string; value: string; onChange: (c: string) => void; onRemove?: () => void }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  return (
    <div className="ge-stop">
      <span className="dl">{label}</span>
      <label className="ge-chip" style={{ background: value }}><input type="color" value={value.toLowerCase()} onChange={e => onChange(e.target.value.toUpperCase())} aria-label={`${label} colour`} /></label>
      <input className="ge-hex mono" value={draft} spellCheck={false} maxLength={7}
        onChange={e => { const v = ('#' + e.target.value.replace(/[^0-9a-f]/gi, '')).slice(0, 7).toUpperCase(); setDraft(v); if (HEX.test(v)) onChange(v) }}
        onBlur={() => setDraft(value)} />
      {onRemove && <Tooltip label="Remove"><button className="ge-x" onClick={onRemove} aria-label={`Remove ${label}`}>×</button></Tooltip>}
    </div>
  )
}
function GradEditor({ value, onChange }: { value: Grad; onChange: (g: Grad) => void }) {
  const dial = useRef<HTMLDivElement>(null)
  const setStop = (i: number, c: string) => onChange({ ...value, stops: value.stops.map((x, k) => k === i ? c : x) })
  const fromPointer = (e: React.PointerEvent) => {
    const r = dial.current!.getBoundingClientRect(); const a = Math.atan2(e.clientX - r.left - r.width / 2, -(e.clientY - r.top - r.height / 2)) * 180 / Math.PI
    onChange({ ...value, angle: (Math.round(a / 5) * 5 + 360) % 360 })
  }
  const three = value.stops.length === 3
  return (
    <div className="ge">
      <div className="ge-top">
        <div className="ge-prev">{['star', 'heart', 'bolt'].map(n => <Icon key={n} name={n} size={28} stroke={1.75} grad={value} />)}</div>
        <div ref={dial} className="ge-dial" style={{ background: gradCss(value) }} title="Drag to rotate"
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e) }} onPointerMove={e => { if (e.buttons) fromPointer(e) }}>
          <i style={{ transform: `rotate(${value.angle}deg)` }} /><span className="mono">{value.angle}°</span>
        </div>
      </div>
      <div className="ge-label"><span className="dl">Presets</span></div>
      <div className="ge-presets">{GRAD_PRESETS.map(([n, p]) => <Tooltip key={n} label={n}><button className={sameGrad(value, p) ? 'on' : ''} style={{ background: gradCss(p) }} onClick={() => onChange(p)} aria-label={n} /></Tooltip>)}</div>
      <div className="ge-label"><span className="dl">Colours</span>
        <span className="ge-tools">
          <Tooltip label="Reverse"><button onClick={() => onChange({ ...value, stops: [...value.stops].reverse() })} aria-label="Reverse colours"><Icon name="refresh" size={14} color="#fff" /></button></Tooltip>
          {!three && <button className="ge-add" onClick={() => onChange({ ...value, stops: [value.stops[0], mix(value.stops[0], value.stops[1]), value.stops[1]] })}>+ Middle</button>}
        </span>
      </div>
      <StopRow label="From" value={value.stops[0]} onChange={c => setStop(0, c)} />
      {three && <StopRow label="Via" value={value.stops[1]} onChange={c => setStop(1, c)} onRemove={() => onChange({ ...value, stops: [value.stops[0], value.stops[2]] })} />}
      <StopRow label="To" value={value.stops[value.stops.length - 1]} onChange={c => setStop(value.stops.length - 1, c)} />
      <div className="ge-label"><span className="dl">Angle</span><span className="mono ge-val">{value.angle}°</span></div>
      <input className="ge-range" type="range" min={0} max={355} step={5} value={value.angle} onChange={e => onChange({ ...value, angle: +e.target.value })} style={{ ['--p' as string]: `${value.angle / 355 * 100}%` }} />
    </div>
  )
}
