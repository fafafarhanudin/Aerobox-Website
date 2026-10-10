import type React from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CloseButton, Icon, Modal, Tooltip, copyText, download, iconSvg, useToast, Key, Legend, ICON_STYLES, gradCss, type Grad, type IconStyle } from '../ui'
import { ICONS, ICON_CATS, type Icon as IconT } from '../data/icons'
import { pop } from '../lib/confetti'
import { RequestKey, useRequest } from '../request'
import { ColorPicker, ColorWell, DockDownloadAll, PageHead } from '../pagekit'
import { AVATARS, FLAGS, PHOTOS, type FlagT } from '../data/collections'

const SWATCHES = ['#16171B', '#6B6E78', '#2F6BFF', '#7C3AED', '#15803D', '#F59E0B', '#E5484D']
const SHORT: Record<string, string> = { 'Communication & Social': 'Social', 'Security & Commerce': 'Security' }

const CAT_ICON: Record<string, string> = { All: 'layers', Layout: 'sidebar-left', General: 'grid', 'Arrows & Actions': 'arrow-right', Communication: 'chat', 'Files & Media': 'folder',
  'Security & Commerce': 'shield', 'Charts & Data': 'chart-bar', 'Dev & System': 'code', Navigation: 'compass', 'Communication & Social': 'share', 'Media & Devices': 'monitor',
  Commerce: 'bag', 'Editor & Text': 'pencil', 'Weather & Nature': 'sun', 'Alerts & Feedback': 'info', Users: 'team', 'Files & Docs': 'file-text', Time: 'alarm',
  'Maps & Travel': 'map', Finance: 'bank', SaaS: 'workflow', Symbols: 'infinity', 'Home & Living': 'lamp', 'Food & Drink': 'pizza', Animals: 'cat', Science: 'flask', Fashion: 'shirt', Tools: 'wrench', Objects: 'paper-plane', Badges: 'plus-circle', 'Text & Editor': 'text-left', Security: 'lock-open', 'Devices & Tech': 'cpu', 'Health & Life': 'activity', Interface: 'toggle', 'Media & Comms': 'cast' }
const NEW_COUNT = ICONS.filter(i => i.new).length
const DOCK_SWATCHES = ['#16171B', '#A3A5AD', '#2F6BFF', '#7A5AF8', '#15803D', '#F59E0B']
const GRAD_PRESETS: [string, Grad][] = [
  ['Aero', { stops: ['#2F6BFF', '#7A5AF8'], angle: 135 }], ['Sunset', { stops: ['#F97316', '#EC4899'], angle: 135 }],
  ['Mint', { stops: ['#10B981', '#06B6D4'], angle: 135 }], ['Candy', { stops: ['#EC4899', '#8B5CF6'], angle: 135 }],
  ['Ember', { stops: ['#F59E0B', '#E5484D'], angle: 180 }], ['Ocean', { stops: ['#06B6D4', '#2563EB'], angle: 180 }],
  ['Aurora', { stops: ['#22C55E', '#06B6D4', '#7A5AF8'], angle: 135 }], ['Graphite', { stops: ['#16171B', '#8D909A'], angle: 135 }],
]
const sameGrad = (a?: Grad | null, b?: Grad | null) => !!a && !!b && a.angle === b.angle && a.stops.join() === b.stops.join()

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
  const [grad, setGrad] = useState<Grad>(GRAD_PRESETS[0][1]); const [useGrad, setUseGrad] = useState(false); const g = useGrad ? grad : undefined
  const [menu, setMenu] = useState<'' | 'sort' | 'style' | 'grad' | 'color'>(''); const [sel, setSel] = useState<IconT | null>(null); const [iconStyle, setIconStyle] = useState<IconStyle>('Aero')
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
  const copyIcon = async (i: IconT, el: Element) => { await copyText(iconSvg(i.name, stroke, color, 24, iconStyle, g)); pop(el, 18); toast(<>Copied <b>{i.name}</b> · {iconStyle}{g ? ' · gradient' : ''}</>) }
  const downloadSet = (el: Element) => {
    const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${filtered.map(i => `<symbol id="${i.name}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${i.body}</symbol>`).join('')}</svg>`
    download('aerobox-icons.svg', sprite); pop(el, 44); toast(<>Downloaded <b>{filtered.length} icons</b> as a sprite</>)
  }
  const pickCat = (c: string) => { setCat(c); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  return (
    <div className="page icons-page">
      <PageHead chip="Icons" count={ICONS.length} fresh={NEW_COUNT} title="Icons" desc="Clean line icons for products, interfaces and design systems. Every icon shares one stroke weight and the Aero corner."
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
                    <span className="style-prev"><Icon name="layers" size={16} stroke={stroke} variant={st} /></span>{st}{mode === 'icons' && iconStyle === st && <span className="live-dot" />}
                  </button>)}
            </div>
          </div>
          <div className="side-group">
            <span className="side-label mono">Collections</span>
            <div className="side-styles">
              {(['avatars', 'flags'] as const).map(m => (
                <button key={m} className={`style-card ${mode === m ? 'on' : ''}`} onClick={() => setMode(v => v === m ? 'icons' : m)}>
                  <span className="style-prev">{m === 'avatars' ? <Coll html={AVATARS[8].svg} size={20} vb={64} /> : <FlagIcon f={FLAGS.find(f => f.code === 'indonesia')!} t="Radius" size={18} />}</span>
                  {m === 'avatars' ? 'Avatars' : 'Flags'}<span className="sc-n mono">{m === 'avatars' ? AVATARS.length : FLAGS.length}</span>
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
            <label className="search"><Icon name="search" size={20} /><input ref={search} value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${ICONS.length} icons`} /><kbd>/</kbd></label>
            <div className="dd-wrap" onClick={e => e.stopPropagation()}>
              <Key onClick={() => setMenu(m => m === 'sort' ? '' : 'sort')}><span className="dim">Sort</span> {sort} <Icon name="arrow-down" size={14} /></Key>
              <div className={`popover right ${menu === 'sort' ? 'on' : ''}`}>{(['Popular', 'A–Z'] as const).map(s => <button key={s} className={`pop-item ${sort === s ? 'on' : ''}`} onClick={() => { setSort(s); setMenu('') }}>{s}</button>)}</div>
            </div>
          </div>
          {mode !== 'icons' && <CollectionGrid key={mode} kind={mode} q={q} size={size} />}
          {mode === 'icons' && groups.map(([title, items]) => (
            <section key={title} className="icon-section">
              <h2>{title} <span className="mono dim">{items.length}</span></h2>
              <div className="icon-grid">
                {items.map((i, k) => (
                  <div key={i.name} className="tile" style={{ ['--i' as string]: Math.min(k, 24) }} onClick={() => setSel(i)}>
                    <span className="tile-ic"><Icon name={i.name} size={size} stroke={stroke} color={color} variant={iconStyle} grad={g} /></span>
                    <span className="tile-name">{i.name}</span>
                    <span className="tile-actions" onClick={e => e.stopPropagation()}>
                      <Tooltip label="Copy SVG"><button onClick={e => copyIcon(i, e.currentTarget)}><Icon name="copy" size={14} /></button></Tooltip>
                      <Tooltip label="Download"><button onClick={() => { download(`${i.name}.svg`, iconSvg(i.name, stroke, color, size, iconStyle, g)); toast(<>Downloaded <b>{i.name}.svg</b></>) }}><Icon name="download" size={14} /></button></Tooltip>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {mode === 'icons' && filtered.length === 0 && <div className="empty"><Icon name="search" size={28} /><b>No icons match “{q}”</b><span>Try “arrow”, “chart” or “user”.</span></div>}
        </div>
      </div>

      <div className={`dock ${dockOn ? 'on' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="dd-wrap">
          <button className="dock-style" onClick={() => setMenu(m => m === 'style' ? '' : 'style')}><span className="dl">Style</span> {iconStyle} <Icon name="arrow-down" size={14} /></button>
          <div className={`popover up dark ${menu === 'style' ? 'on' : ''}`}>{ICON_STYLES.map(st => LOCKED.has(st)
            ? <button key={st} className="pop-item" disabled onClick={() => toast(SOON)}><span className="pi-row"><Icon name="layers" size={16} color="#8D909A" />{st}</span><Icon name="lock" size={13} color="#8D909A" /></button>
            : <button key={st} className={`pop-item ${iconStyle === st ? 'on' : ''}`} onClick={() => { setIconStyle(st); setMode('icons'); setMenu('') }}><span className="pi-row"><Icon name="layers" size={16} variant={st} color="#fff" />{st}</span></button>)}</div>
        </div>
        <span className="dock-div" />
        <div className="dock-step"><span className="dl">Size</span><button onClick={() => setSize(v => Math.max(16, v - 4))} aria-label="Smaller">−</button><b className="mono">{size}</b><button onClick={() => setSize(v => Math.min(36, v + 4))} aria-label="Bigger">+</button></div>
        <span className="dock-div" />
        <div className="dock-step"><span className="dl">Stroke</span><button onClick={() => setStroke(v => Math.max(1, +(v - 0.25).toFixed(2)))} aria-label="Thinner">−</button><b className="mono">{stroke}</b><button onClick={() => setStroke(v => Math.min(2.5, +(v + 0.25).toFixed(2)))} aria-label="Thicker">+</button></div>
        <span className="dock-div" />
        <div className="dock-sw">{DOCK_SWATCHES.map(c => <Tooltip key={c} label={c}><button className={!useGrad && c === color ? 'on' : ''} style={{ background: c }} onClick={() => { setColor(c); setUseGrad(false) }} aria-label={c} /></Tooltip>)}
          <div className="dd-wrap"><ColorWell on={!useGrad && !DOCK_SWATCHES.includes(color)} color={color} onClick={() => setMenu(m => m === 'color' ? '' : 'color')} />
            <div className={`popover up dark cpk-pop ${menu === 'color' ? 'on' : ''}`}>{menu === 'color' && <ColorPicker value={color} onChange={c => { setColor(c); setUseGrad(false) }} />}</div></div>
        </div>
        <span className="dock-div" />
        <div className="dd-wrap">
          <button className={`dock-gbtn ${useGrad ? 'on' : ''}`} onClick={() => { setUseGrad(true); setMenu(m => m === 'grad' ? '' : 'grad') }} aria-expanded={menu === 'grad'}>
            <i style={{ background: gradCss(grad) }} /><span className="dl">Gradient</span><Icon name="arrow-down" size={14} /></button>
          <div className={`popover up dark grad-pop ${menu === 'grad' ? 'on' : ''}`}><GradEditor value={grad} onChange={v => { setGrad(v); setUseGrad(true) }} /></div>
        </div>
        <span className="dock-div" />
        <DockDownloadAll />
      </div>
      <IconModal icon={sel} onClose={() => setSel(null)} stroke={stroke} color={color} grad={g} iconStyle={iconStyle} />
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
  const file = (id: string) => photo ? `avatar-${id}.jpg` : `${av ? 'avatar' : 'flag'}-${id}${av ? '' : '-' + ft.toLowerCase()}.svg`
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

function IconModal({ icon, onClose, stroke: s0, color: c0, grad: g0, iconStyle }: { icon: IconT | null; onClose: () => void; stroke: number; color: string; grad?: Grad; iconStyle: IconStyle }) {
  const toast = useToast()
  const [size, setSize] = useState(24); const [stroke, setStroke] = useState(s0); const [color, setColor] = useState(c0); const [grad, setGrad] = useState<Grad | undefined>(g0); const [tab, setTab] = useState<'SVG' | 'React' | 'Vue'>('SVG')
  const last = useRef<IconT | null>(null); if (icon) last.current = icon
  const i = icon ?? last.current
  useEffect(() => { if (icon) { setStroke(s0); setColor(c0); setGrad(g0); setSize(24) } }, [icon, s0, c0, g0])
  if (!i) return null
  const comp = i.name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')
  const paintProp = (vue: boolean) => grad ? `${vue ? ':gradient="' : 'gradient={'}{ stops: [${grad.stops.map(c => `'${c}'`).join(', ')}], angle: ${grad.angle} }${vue ? '"' : '}'}` : `color="${color}"`
  const code = tab === 'SVG' ? iconSvg(i.name, stroke, color, size, iconStyle, grad) : tab === 'React' ? `import { ${comp} } from "aerobox-icons"\n\n<${comp} size={${size}} strokeWidth={${stroke}} ${paintProp(false)} />` : `<script setup>\nimport { ${comp} } from "aerobox-icons/vue"\n</script>\n\n<${comp} :size="${size}" :stroke-width="${stroke}" ${paintProp(true)} />`
  const copy = async (what: string, txt: string, el: Element) => { await copyText(txt); pop(el, 22); toast(<>Copied <b>{i.name}</b> as {what}</>) }
  return (
    <Modal open={!!icon} onClose={onClose} label={`Icon ${i.name}`} width={600}>
      <div className="icon-modal">
        <div className="im-head"><b>{i.name}</b><span className="badge-n">{i.cat}</span><span className="badge-n">{size}px</span><span className="badge-n">{iconStyle}</span><CloseButton onClick={onClose} /></div>
        <div className="im-preview">
          <div className="im-big" key={i.name}><Icon name={i.name} size={96} stroke={stroke} color={color} variant={iconStyle} grad={grad} /></div>
          <div className="im-sizes">{[16, 20, 24, 32, 48].map(v => <button key={v} className={v === size ? 'on' : ''} onClick={() => setSize(v)}><Icon name={i.name} size={v} stroke={stroke} color={color} variant={iconStyle} grad={grad} /><span className="mono">{v}</span></button>)}</div>
        </div>
        <div className="im-controls">
          <div className="stepper"><span>Size</span><button onClick={() => setSize(v => Math.max(12, v - 4))}>−</button><b className="mono">{size}</b><button onClick={() => setSize(v => Math.min(64, v + 4))}>+</button></div>
          <div className="stepper"><span>Stroke</span><button onClick={() => setStroke(v => Math.max(1, +(v - 0.25).toFixed(2)))}>−</button><b className="mono">{stroke}</b><button onClick={() => setStroke(v => Math.min(3, +(v + 0.25).toFixed(2)))}>+</button></div>
          <div className="swatches">{SWATCHES.map(c => <button key={c} className={`sw-btn ${!grad && c === color ? 'on' : ''}`} style={{ background: c }} onClick={() => { setColor(c); setGrad(undefined) }} aria-label={c} />)}
            <span className="sw-div" />
            {(g0 && !GRAD_PRESETS.some(p => sameGrad(p[1], g0)) ? [['Custom', g0] as [string, Grad], ...GRAD_PRESETS.slice(0, 3)] : GRAD_PRESETS.slice(0, 4)).map(([n, p]) =>
              <Tooltip key={n} label={n}><button className={`sw-btn ${sameGrad(grad, p) ? 'on' : ''}`} style={{ background: gradCss(p) }} onClick={() => setGrad(p)} aria-label={`${n} gradient`} /></Tooltip>)}</div>
        </div>
        <div className="code">
          <div className="code-tabs">{(['SVG', 'React', 'Vue'] as const).map(t => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
            <Tooltip label="Copy snippet"><button className="code-copy" onClick={e => copy(tab, code, e.currentTarget)}><Icon name="copy" size={14} /></button></Tooltip></div>
          <pre>{code}</pre>
        </div>
        <div className="im-foot">
          <span className="mono dim"><kbd>esc</kbd> to close</span>
          <div className="row">
            <Key onClick={() => { download(`${i.name}.svg`, iconSvg(i.name, stroke, color, size, iconStyle, grad)); toast(<>Downloaded <b>{i.name}.svg</b></>) }}>Download</Key>
            <Key onClick={e => copy('JSX', `<${comp} size={${size}} strokeWidth={${stroke}} />`, e.currentTarget)}>Copy JSX</Key>
            <Key variant="primary" onClick={e => copy('SVG', iconSvg(i.name, stroke, color, size, iconStyle, grad), e.currentTarget)}>Copy SVG <kbd>↵</kbd></Key>
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
