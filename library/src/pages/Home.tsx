import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { BrandMark, Icon, Mark, Tooltip, XLogo, copyText, useReveal, useToast, Key, Legend, type IconStyle } from '../ui'
import { COUNTS, MARQUEE, WORLD_LITE, ISO_LITE } from '../data/lite'
import { OGCard, SITE, intentUrl, SHARE_LINES } from '../share'
import { go, type Modals } from '../App'
import { pop } from '../lib/confetti'
import { HeroLogo } from '../logo'
import { isPrerendered } from '../boot'

export default function Home({ modals }: { modals: Modals }) {
  return (<><Hero />
    <Later h={240}><Marquee /></Later><Later h={1400}><Showcase /></Later>
    <Later h={700}><Support modals={modals} /></Later><Later h={800}><Faq modals={modals} /></Later></>)
}

/** Below-the-fold sections mount as they come near the screen, so the first paint and the first seconds of the
 *  page are not spent drawing a 120-icon wall nobody can see yet. `home:mount` (the FAQ link) mounts them all. */
export const mountHome = () => window.dispatchEvent(new Event('home:mount'))
function Later({ h, children }: { h: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current; if (on || !el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true) }, { rootMargin: '250px 0px' })
    const all = () => setOn(true)
    io.observe(el); window.addEventListener('home:mount', all)
    return () => { io.disconnect(); window.removeEventListener('home:mount', all) }
  }, [on])
  return on ? <>{children}</> : <div ref={ref} style={{ minHeight: h }} aria-hidden />
}

export function Hero() {
  const [q, setQ] = useState(''); const [still] = useState(isPrerendered)
  const ref = useRef<HTMLElement>(null)
  return (
    <section className={`hero ${still ? 'is-still' : ''}`} ref={ref}>
      <div className="hero-bg" aria-hidden>
        <i className="hb-blob a" /><i className="hb-blob b" /><i className="hb-blob c" />
        <div className="hb-grid" />
      </div>
      <HeroLogo />
      <a className="hero-chip" href="#/logos"><span className="dot" /><span className="hc-t">New: sportswear, car and football logos</span><Icon name="arrow-right" size={14} /></a>
      <h1>Beautiful assets for<br /><span>better interfaces.</span></h1>
      <p>Discover curated icons, gradients, logos and isometric templates, ready to copy, customize and ship.</p>
      <form className="hero-search" onSubmit={e => { e.preventDefault(); go('icons', q) }}>
        <Icon name="search" size={20} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search icons, gradients, logos…" /><kbd>⌘K</kbd>
        <Key variant="primary" type="submit"><span className="hs-label">Browse library</span> <Icon name="arrow-right" size={16} /></Key>
      </form>
    </section>
  )
}

function Marquee() {
  const toast = useToast()
  const rowA = MARQUEE.slice(0, 22), rowB = MARQUEE.slice(22, 44)
  const Row = ({ items, rev }: { items: typeof MARQUEE; rev?: boolean }) => (
    <div className={`mq-row ${rev ? 'rev' : ''}`}><div className="mq-track">{[...items, ...items].map((m, k) => <div key={k} className="mq-item"><a href="#/logos"><Mark svg={m.svg} size={24} /><span>{m.name}</span></a><Tooltip label="Copy SVG"><button className="mq-copy" aria-label={`Copy ${m.name}`} onClick={async e => { const el = e.currentTarget; await copyText(m.svg); pop(el, 16); toast(<>Copied <b>{m.name}</b> mark</>) }}><Icon name="copy" size={14} /></button></Tooltip></div>)}</div></div>)
  return (
    <section className="marquee">
      <p className="eyebrow">Fresh in the logo library · 68 templates</p>
      <Row items={rowA} /><Row items={rowB} rev />
    </section>
  )
}

const n0 = (v: number) => v.toLocaleString('en-US')
type Feat = [icon: string, label: string, text: string]
const CARDS: { no: string; name: string; lede: string; feats: Feat[]; count: string; fmt: string; route: 'icons' | 'gradients' | 'isometric' | 'logos' }[] = [
  { no: '01', name: 'Aero Icons', route: 'icons', fmt: 'SVG · JSX · FIG', count: `${n0(COUNTS.icons)} icons · ${COUNTS.avatars} avatars · ${COUNTS.flags} flags`,
    lede: `${n0(COUNTS.icons)} icons that change style, colour and motion right on the page, then paste into Figma as one clean vector.`,
    feats: [['layers-three-01', 'Five styles', 'Aero, Duotone, Two-tone, Filled and Sharp.'],
      ['palette', 'Two colours, your pick', 'Line and fill, or two line colours.'],
      ['play-circle', 'Motion inside the file', 'Six motions that stay in the copied SVG.'],
      ['figma', 'Clean paste', 'One named vector per icon, no masks.']] },
  { no: '02', name: 'Grain Gradients', route: 'gradients', fmt: 'CSS · Tailwind · PNG · Video', count: `${COUNTS.gradients} gradients`,
    lede: `${COUNTS.gradients} mesh, linear, radial and conic gradients you can texture, tune and set in motion before you export.`,
    feats: [['grid-03', 'Grain or dither', 'Film grain or Bayer dither, up to 16×16.'],
      ['wind-01', 'Gradients that move', 'Five motions, as CSS or a looping video.'],
      ['sliders-02', 'Tune the palette', 'Hue, saturation, brightness and blur.'],
      ['crop-01', 'Any frame', 'Five ratios, PNG up to 1920 px.']] },
  { no: '03', name: 'Isometric', route: 'isometric', fmt: 'SVG · FIG · PNG', count: `${COUNTS.iso} scenes`,
    lede: `${COUNTS.iso} scenes for SaaS, fintech, Web3, tech and marketing pages, all on one 30° grid so they sit together.`,
    feats: [['palette', 'Four palettes or your own', 'Four palettes, or a ramp from any colour.'],
      ['sunrise', 'Shadows you steer', 'Soft or long, with angle, blur and opacity.'],
      ['grid-01', 'Scene backgrounds', 'Plain, grid or glow behind every scene.'],
      ['brush-01', 'Line weight', '1, 1.5 or 2 px outlines to match your icons.']] },
  { no: '04', name: 'Logos', route: 'logos', fmt: 'SVG · PNG', count: `${n0(COUNTS.world)} brands · ${COUNTS.marks + COUNTS.lockups} templates`,
    lede: `${n0(COUNTS.world)} real brand logos and ${COUNTS.marks + COUNTS.lockups} placeholder templates for mockups, docs and decks.`,
    feats: [['tag-01', 'Sorted by field', 'AI, software, dev, design, payments and more.'],
      ['contrast-01', 'Five colour modes', 'Original, grey, black, white or duotone.'],
      ['moon-01', 'Icon or wordmark', 'The mark or full wordmark, light or dark.'],
      ['type-01', 'Placeholder templates', `${COUNTS.marks} marks and ${COUNTS.lockups} lockups for early layouts.`]] },
]
const WALL = ['home-02', 'search-md', 'layers-three-01', 'heart', 'folder', 'message-circle-01', 'calendar', 'image-01', 'bell-01', 'code-01', 'cloud-01', 'shield-01', 'marker-pin-01', 'star-01', 'compass', 'user-01', 'music-note-01', 'camera-01', 'gift-01', 'rocket-01', 'zap', 'feather', 'send-01', 'link-01', 'palette', 'globe-01', 'tag-01', 'coins-01', 'mail-01', 'lock-01', 'brush-01', 'moon-01', 'sun', 'flag-01', 'crop-01', 'truck-01']
// real brands on the Logos card (files from the real-world set, shown as app-style tiles)
const BRANDS = ['Figma', 'Spotify', 'Stripe', 'Slack', 'Airbnb', 'Claude', 'Discord', 'Netflix', 'Google', 'Supabase'].map(n => WORLD_LITE.find(w => w.name === n)).filter(Boolean) as typeof WORLD_LITE
const WALL60 = [...WALL, ...WALL.slice(0, 24)] // 60 = 6 or 10 full rows
const REEL = [...BRANDS.slice(-1), ...BRANDS, ...BRANDS.slice(0, 1)]
// the isometric bento card cycles through a hand-picked reel
const ISO_REEL = ['team-workspace', 'gold-bars', 'robot', 'house', 'data-center', 'lighthouse2', 'shopping-cart', 'mining-rig', 'award-podium', 'bank2', 'forest2', 'help-desk'].map(k => ISO_LITE.find(t => t.key === k)).filter(Boolean) as typeof ISO_LITE

/* Each card plays its four features in turn; the stage acts out whichever feature is lit. */
const FEAT_MS = 2600, STEP_MS = 1300
const STYLES: IconStyle[] = ['Aero', 'Duotone', 'Two-tone', 'Filled', 'Sharp']
const RATIOS = [['4:3', '1600×1200'], ['16:9', '1920×1080'], ['9:16', '1080×1920'], ['1:1', '1600×1600']] as const
const PALETTES = [['Blue', 'none'], ['Green', 'hue-rotate(-95deg) saturate(.85)'], ['Violet', 'hue-rotate(38deg)'], ['Mono', 'grayscale(1) contrast(1.05)']] as const
const FIELDS = ['AI', 'Software', 'Dev', 'Data', 'Design', 'Social', 'Payments']
const MODES = ['Original', 'Grey', 'Black', 'White', 'Duotone']
function Showcase() {
  // one state for card + feature, so the advance stays a pure update
  const [pos, setPos] = useState({ a: 0, f: 0 }); const [step, setStep] = useState(0)
  const hover = useRef(false); const ref = useReveal<HTMLElement>()
  useEffect(() => {
    const next = window.setInterval(() => { if (!hover.current) setPos(p => p.f < 3 ? { a: p.a, f: p.f + 1 } : { a: (p.a + 1) % CARDS.length, f: 0 }) }, FEAT_MS)
    const tick = window.setInterval(() => setStep(s => s + 1), STEP_MS)
    return () => { window.clearInterval(next); window.clearInterval(tick) }
  }, [])
  const isoI = step % ISO_REEL.length, reel = 1 + (step % BRANDS.length)
  return (
    <section className="showcase reveal" ref={ref}>
      <div className="sc-top">
        <div>
          <div className="sc-eyebrow"><span>03</span><i /><span>Collection</span></div>
          <h2>Four libraries.<br /><span>One quiet system.</span></h2>
        </div>
        <div className="sc-intro">
          <p>Icons, gradients, isometric scenes and logos, each with its own editor. Restyle, recolour and animate on the page, then take the file as SVG, PNG, CSS or a Figma-ready vector. Free for personal and commercial work.</p>
          <div className="sc-actions"><Key onClick={() => go('icons')}>Browse all assets <Icon name="arrow-up-right" size={16} /></Key><span className="mono">v2.0 · updated weekly</span></div>
        </div>
      </div>
      <div className="sc-grid">
        {CARDS.map((c, k) => {
          const on = pos.a === k, f = on ? pos.f : -1, st = on ? step : 0
          // stage acts
          const style = k === 0 ? (f === 0 ? STYLES[st % STYLES.length] : f === 1 ? (st % 2 ? 'Duotone' : 'Two-tone') : f === 3 ? 'Filled' : 'Aero') : 'Aero'
          const motionKind = (['Bounce', 'Pop', 'Float'] as const)[st % 3]
          const ratio = RATIOS[st % RATIOS.length], hue = [0, 45, 120, -60][st % 4], bayer = [2, 4, 8, 16][st % 4]
          const pal = PALETTES[st % PALETTES.length], bg = (['Plain', 'Grid', 'Glow'] as const)[st % 3], mode = MODES[st % MODES.length]
          const chip = k === 0 ? (f === 0 ? style : f === 1 ? (style === 'Two-tone' ? 'Two-tone · two line colours' : 'Duotone · line + fill') : f === 2 ? `Motion · ${motionKind}` : f === 3 ? `${WALL[15]}.svg · 1 vector` : 'Aero')
            : k === 1 ? (f === 0 ? (st % 2 ? `Dither · Bayer ${bayer}×${bayer}` : 'Grain · 32%') : f === 1 ? `${['Drift', 'Orbit', 'Breathe'][st % 3]} · loop` : f === 2 ? `Hue ${hue > 0 ? '+' : ''}${hue}°` : f === 3 ? `${ratio[0]} · ${ratio[1]}` : 'Aurora · Mesh · Grain')
              : k === 2 ? (f === 0 ? `Palette · ${pal[0]}` : f === 1 ? (st % 2 ? 'Long shadow' : 'Soft shadow') : f === 2 ? `Background · ${bg}` : f === 3 ? `${['1', '1.5', '2'][st % 3]} px outline` : ISO_REEL[isoI].name)
                : (f === 0 ? `Field · ${FIELDS[st % FIELDS.length]}` : f === 1 ? `Colour · ${mode}` : f === 2 ? (st % 2 ? 'Dark tiles' : 'Light tiles') : f === 3 ? `${COUNTS.marks} marks · ${COUNTS.lockups} lockups` : REEL[reel].name)
          return (
            <article key={c.no} className={`sc-card c${k} ${on ? 'on' : ''}`} onMouseEnter={() => { hover.current = true; if (!on) setPos({ a: k, f: 0 }) }} onMouseLeave={() => { hover.current = false }} onClick={() => go(c.route)}>
              <div className="sc-stage">
                {k === 0 && <div className={`wall ${f === 2 ? 'is-moving' : ''} ${f === 3 ? 'is-named' : ''}`}>{[...WALL60, ...WALL60].map((n, i) => <span key={i} className={i % WALL60.length === 15 ? 'accent' : ''} style={{ ['--w' as string]: i % 7 }}>
                  <Icon name={'u:' + n} size={22} stroke={1.5} variant={style} color2={style === 'Two-tone' ? '#7EA2FF' : undefined} motion={f === 2 ? { kind: motionKind, speed: motionKind === 'Float' ? 2.6 : 1.3, delay: (i % 7) * .12 } : undefined} /></span>)}</div>}
                {k === 1 && <div className={`mesh ${f === 0 && st % 2 ? 'is-dither' : ''} ${f === 1 ? 'is-moving' : ''} ${f === 3 ? `r-${ratio[0].replace(':', 'x')}` : ''}`} style={f === 2 ? { filter: `hue-rotate(${hue}deg)` } : undefined}><i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" /><span className="dither" /></div>}
                {k === 2 && <div className={`iso-stage ${f === 1 ? (st % 2 ? 'sh-long' : 'sh-soft') : ''} ${f === 2 ? `bg-${bg.toLowerCase()}` : ''} ${f === 3 ? `lw-${st % 3}` : ''}`} style={f === 0 ? { ['--iso-filter' as string]: pal[1] } : undefined}><i className="floor" /><i className="glow" /><i className="long" /><i className="shadow" />
                  <div className="iso-art"><div key={isoI} className="iso-swap" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 240 200" width="264" height="220">${ISO_REEL[isoI].svg}</svg>` }} /></div></div>}
                {k === 3 && <div className={`reel ${f === 1 ? `tone-${mode.toLowerCase()}` : ''} ${f === 2 && st % 2 ? 'is-dark' : ''}`} style={{ transform: `translateX(${-reel * 108}px)`, transition: reel === 1 ? 'none' : undefined }}>{REEL.map((w, i) => <div key={i} className={`reel-item ${i === reel ? 'on' : ''}`}><span className="brand-tile"><img src={`/library/world/${w.files.light}`} alt="" width={36} height={36} /></span><span>{w.name}</span></div>)}</div>}
                <span key={chip} className="sc-chip mono">{chip}</span>
                <span className="dim-layer" />
              </div>
              <div className="sc-meta">
                <div className="sc-head"><span className="mono dim">{c.no}</span><h3>{c.name}</h3><p>{c.lede}</p></div>
                <div className="sc-feats">{c.feats.map(([ic, label, text], j) => (
                  <div key={label} className={`sc-feat ${j === f ? 'on' : ''}`} onMouseEnter={() => setPos({ a: k, f: j })}>
                    <span className="sc-feat-ic"><Icon name={'u:' + ic} size={16} stroke={1.7} /></span>
                    <span className="sc-feat-txt"><b>{label}</b><span>{text}</span></span>
                  </div>))}</div>
                <div className="sc-foot">
                  <div className="mono"><span>{c.count}</span><span className="dim">{c.fmt}</span></div>
                  <span className="sc-link">Open library <Icon name="arrow-up-right" size={16} /></span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      <div className="sc-bottom mono"><span><i className="led" />All libraries free · no sign-up · MIT-style licence</span><span className="dim">Scroll to explore ↓</span></div>
    </section>
  )
}

function Support({ modals }: { modals: Modals }) {
  const toast = useToast(); const ref = useReveal<HTMLElement>()
  const [li, setLi] = useState(0); const text = SHARE_LINES[li]
  const [liked, setLiked] = useState(false)
  return (
    <section className="support reveal" ref={ref}>
      <div className="support-panel">
        <div className="aurora" aria-hidden><i className="a1" /><i className="a2" /><i className="a3" /><i className="a4" /><span className="aurora-grain" /></div>
        <div className="sh-copy">
          <span className="sh-chip"><XLogo size={11} color="#fff" /> Spread the word</span>
          <h2>Share Aerobox Assets.<br /><span>Make someone’s day.</span></h2>
          <p>Every asset stays free. The best way to help is a quick post, so the next designer finds it too.</p>
          <div className="sh-lines" role="tablist" aria-label="Pick a post">
            {SHARE_LINES.map((_, k) => <button key={k} role="tab" aria-selected={li === k} className={li === k ? 'on' : ''} onClick={() => setLi(k)}>Post {k + 1}</button>)}
            <Tooltip label="Another line"><button className="sh-shuffle" onClick={e => { pop(e.currentTarget, 10); setLi(v => (v + 1) % SHARE_LINES.length) }} aria-label="Another line"><Icon name="shuffle" size={14} /></button></Tooltip>
          </div>
          <div className="sh-actions">
            <Key variant="primary" href={intentUrl(text)} target="_blank" onClick={e => pop(e.currentTarget, 36)}><XLogo size={14} color="#fff" /> Post on X <Legend>↗</Legend></Key>
            <Key onClick={async e => { const el = e.currentTarget; await copyText(SITE); pop(el, 24); toast('Link copied to clipboard') }}><Icon name="link" size={15} /> Copy link</Key>
          </div>
          <span className="sh-note mono">Opens X with the post filled in. You can edit it before posting.</span>
        </div>
        <div className="sh-stage">
          <span className="sh-float f1"><Icon name="heart" size={18} /></span><span className="sh-float f2"><Icon name="repeat" size={18} /></span><span className="sh-float f3"><Icon name="sparkles" size={18} /></span>
          <article className="x-post">
            <header><span className="xp-av"><BrandMark size={22} /></span><div><b>You</b><span>@you · now</span></div><XLogo size={16} /></header>
            <p key={li} className="xp-text">{text} <a href={SITE}>aeroboxstudio.com/library</a></p>
            <button className="xp-card" onClick={modals.share} aria-label="Open share preview"><OGCard width={372} /><span className="xp-domain">aeroboxstudio.com/library</span></button>
            <footer>
              <span><Icon name="chat" size={16} /></span><span><Icon name="repeat" size={16} /></span>
              <button className={`xp-like ${liked ? 'on' : ''}`} onClick={e => { setLiked(v => !v); if (!liked) pop(e.currentTarget, 14) }} aria-label="Like"><Icon name="heart" size={16} /></button>
              <span><Icon name="bookmark" size={16} /></span><span><Icon name="share" size={16} /></span>
            </footer>
          </article>
        </div>
      </div>
    </section>
  )
}

const FAQS: [string, string][] = [
  ['Is Aerobox Assets really free?', 'Yes. Every icon, gradient, logo template and isometric scene is free to use in personal and commercial work. There is no account, no paywall and no watermark on the files you download.'],
  ['Do I need to credit Aerobox Assets?', 'No, attribution is optional. If a project of yours uses the library, a mention or a tag on X is always appreciated and helps other designers find it.'],
  ['Which formats can I download?', 'Icons copy as SVG or JSX, gradients as CSS, Tailwind or PNG, isometric scenes as SVG, and logos as SVG. Everything pastes straight into Figma.'],
  ['Can I change colours, stroke and size?', 'Yes. Use the floating dock on each page to set stroke, size, colour and gradients for icons, palettes and shadows for isometric scenes, or colour modes for logos. What you copy matches what you see.'],
  ['Can I request an asset?', 'Of course. Every page has a Request button. Tell us what you need and the most requested items go into the next weekly update.'],
  ['How can I support the project?', 'Share it on X, or tap Support to send any amount through QRIS with GoPay, OVO, DANA, ShopeePay or a banking app. Sponsors can also book a placement.'],
]
function Faq({ modals }: { modals: Modals }) {
  const [open, setOpen] = useState(0); const ref = useReveal<HTMLElement>()
  return (
    <section id="faq" className="faq reveal" ref={ref}>
      <div className="faq-intro">
        <div className="sc-eyebrow dark"><span>05</span><i /><span>FAQ</span><span className="faq-n">{FAQS.length}</span></div>
        <h2>Questions, answered</h2>
        <p>The things people ask before they start using Aerobox Assets. Anything else? Send a message and Farhan will reply.</p>
        <Key onClick={e => { pop(e.currentTarget, 18); modals.support() }}>Send a message <Legend><Icon name="corner-down-left" size={12} /></Legend></Key>
      </div>
      <div className="faq-list">
        {FAQS.map(([q, a], i) => (
          <div key={q} className={`faq-item ${open === i ? 'on' : ''}`}>
            <button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{q}</span>
              <span className={`key key--sm faq-key ${open === i ? 'key--primary' : ''}`} aria-hidden><span className="key__cap"><Icon name={open === i ? 'minus' : 'plus'} size={14} /></span></span>
            </button>
            <div className="faq-a"><div><p>{a}</p></div></div>
          </div>
        ))}
      </div>
    </section>
  )
}
