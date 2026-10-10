import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { BrandMark, Icon, Mark, Tooltip, XLogo, copyText, useReveal, useToast, Key, Legend } from '../ui'
import { OGCard, SITE, intentUrl, SHARE_LINES } from '../share'
import { MARKS } from '../data/logos'
import { ISO } from '../data/iso'
import { go, type Modals } from '../App'
import { pop } from '../lib/confetti'
import { HeroLogo } from '../logo'

export default function Home({ modals }: { modals: Modals }) {
  return (<><Hero /><Marquee /><Showcase /><Support modals={modals} /><Faq modals={modals} /></>)
}

function Hero() {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLElement>(null)
  return (
    <section className="hero" ref={ref}>
      <div className="hero-bg" aria-hidden>
        <i className="hb-blob a" /><i className="hb-blob b" /><i className="hb-blob c" />
        <div className="hb-grid" />
      </div>
      <HeroLogo />
      <a className="hero-chip" href="#/icons"><span className="dot" />New: 300 icons, 100 gradients and 82 isometric scenes<Icon name="arrow-right" size={14} /></a>
      <h1>Beautiful assets for<br /><span>better interfaces.</span></h1>
      <p>Discover curated icons, gradients, logos and isometric templates, ready to copy, customize and ship.</p>
      <form className="hero-search" onSubmit={e => { e.preventDefault(); go('icons', q) }}>
        <Icon name="search" size={20} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search icons, gradients, logos…" /><kbd>⌘K</kbd>
        <Key variant="primary" type="submit">Browse library <Icon name="arrow-right" size={16} /></Key>
      </form>
      <div className="hero-floats" aria-hidden>
        {[['layers', -1], ['heart', 1], ['star', -1], ['bolt', 1], ['palette', -1], ['rocket', 1]].map(([n, d], k) =>
          <span key={n as string} className={`float f${k}`} style={{ ['--d' as string]: d }}><Icon name={n as string} size={22} /></span>)}
      </div>
    </section>
  )
}

function Marquee() {
  const toast = useToast()
  const rowA = MARKS.slice(0, 22), rowB = MARKS.slice(22, 44)
  const Row = ({ items, rev }: { items: typeof MARKS; rev?: boolean }) => (
    <div className={`mq-row ${rev ? 'rev' : ''}`}><div className="mq-track">{[...items, ...items].map((m, k) => <div key={k} className="mq-item"><a href="#/logos"><Mark svg={m.svg} size={24} /><span>{m.name}</span></a><Tooltip label="Copy SVG"><button className="mq-copy" aria-label={`Copy ${m.name}`} onClick={async e => { const el = e.currentTarget; await copyText(m.svg); pop(el, 16); toast(<>Copied <b>{m.name}</b> mark</>) }}><Icon name="copy" size={14} /></button></Tooltip></div>)}</div></div>)
  return (
    <section className="marquee">
      <p className="eyebrow">Fresh in the logo library · 68 templates</p>
      <Row items={rowA} /><Row items={rowB} rev />
    </section>
  )
}

const CARDS = [
  { no: '01', name: 'Aero Icons', desc: '598 icons, 100 of them drawn in one continuous line, plus avatars and flags.', count: '598 icons', fmt: 'SVG · JSX · FIG', route: 'icons' as const },
  { no: '02', name: 'Grain Gradients', desc: '206 mesh, linear, radial and conic gradients with fine grain.', count: '206 gradients', fmt: 'CSS · Tailwind · PNG', route: 'gradients' as const },
  { no: '03', name: 'Isometric', desc: '176 scenes for SaaS, fintech, Web3, tech and marketing pages.', count: '176 templates', fmt: 'SVG · FIG · PNG', route: 'isometric' as const },
  { no: '04', name: 'Logo Marks', desc: '68 placeholder marks built from constructed geometry.', count: '68 templates', fmt: 'SVG · PNG', route: 'logos' as const },
]
const WALL = ['home', 'search', 'layers', 'heart', 'folder', 'chat', 'calendar', 'image', 'bell', 'code', 'cloud', 'shield', 'pin', 'star', 'compass', 'user', 'music', 'camera', 'gift', 'rocket', 'bolt', 'leaf', 'send', 'link', 'palette', 'globe', 'tag', 'coins', 'mail', 'lock', 'brush', 'moon', 'sun', 'flag', 'crop', 'truck']
const REEL = ['Swirl', 'Orbit', 'Kitefly', 'Quanta', 'Swirl', 'Orbit', 'Kitefly'].map(n => MARKS.find(m => m.name === n)!)
// the isometric bento card cycles through a hand-picked reel
const ISO_REEL = ['factory', 'server-cluster', 'robot', 'crypto-coin', 'data-center', 'gold-bars', 'drone', 'analytics-board', 'diamond', 'to-the-moon'].map(k => ISO.find(t => t.key === k)).filter(Boolean) as typeof ISO

function Showcase() {
  const [active, setActive] = useState(0); const [hover, setHover] = useState(false); const [tick, setTick] = useState(0)
  const ref = useReveal<HTMLElement>()
  useEffect(() => { if (hover) return; const id = window.setTimeout(() => { setActive(a => (a + 1) % 4); setTick(t => t + 1) }, 4000); return () => window.clearTimeout(id) }, [active, hover, tick])
  const [reel, setReel] = useState(1)
  const [isoI, setIsoI] = useState(0)
  useEffect(() => { const id = window.setInterval(() => setIsoI(i => (i + 1) % ISO_REEL.length), 2400); return () => window.clearInterval(id) }, [])
  useEffect(() => { const id = window.setInterval(() => setReel(r => r >= 5 ? 1 : r + 1), 1400); return () => window.clearInterval(id) }, [])
  return (
    <section className="showcase reveal" ref={ref}>
      <div className="sc-top">
        <div>
          <div className="sc-eyebrow"><span>03</span><i /><span>Collection</span></div>
          <h2>Four libraries.<br /><span>One quiet system.</span></h2>
        </div>
        <div className="sc-intro">
          <p>Over 1,000 assets drawn in-house: icons, gradients, isometric scenes and logo marks. Every file ships as SVG, PNG, CSS, React and Figma, free for personal and commercial work.</p>
          <div className="sc-actions"><Key onClick={() => go('icons')}>Browse all assets <Icon name="arrow-up-right" size={16} /></Key><span className="mono">v2.0 · updated weekly</span></div>
        </div>
      </div>
      <div className="sc-grid">
        {CARDS.map((c, k) => (
          <article key={c.no} className={`sc-card c${k} ${active === k ? 'on' : ''}`} onMouseEnter={() => { setActive(k); setHover(true) }} onMouseLeave={() => setHover(false)} onClick={() => go(c.route)}>
            <div className="sc-meta">
              <div className="sc-head"><span className="mono dim">{c.no}</span><h3>{c.name}</h3><p>{c.desc}</p></div>
              <div className="sc-foot">
                <div className="mono"><span>{c.count}</span><span className="dim">{c.fmt}</span></div>
                <span className="sc-link">Open library <Icon name="arrow-up-right" size={16} /></span>
                <div className="sc-track"><i key={active === k ? `run${tick}` : 'idle'} className={active === k ? (hover ? 'full' : 'run') : ''} /></div>
              </div>
            </div>
            <div className="sc-stage">
              {k === 0 && <div className="wall">{[...WALL, ...WALL].map((n, i) => <span key={i} className={i % WALL.length === 15 ? 'accent' : ''} style={{ ['--w' as string]: i % 7 }}><Icon name={n} size={22} /></span>)}</div>}
              {k === 1 && <div className="mesh"><i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" /><span className="chip mono"><b>Aurora</b><b>Mesh</b><b>Grain</b></span></div>}
              {k === 2 && <div className="iso-stage"><i className="glow" /><i className="shadow" />
                <div className="iso-art"><div key={isoI} className="iso-swap" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 240 200" width="264" height="220">${ISO_REEL[isoI].svg}</svg>` }} /></div>
                <span key={'n' + isoI} className="iso-name mono">{ISO_REEL[isoI].name}</span></div>}
              {k === 3 && <div className="reel" style={{ transform: `translateX(${-reel * 150 + 85}px)`, transition: reel === 1 ? 'none' : undefined }}>{REEL.map((m, i) => <div key={i} className={`reel-item ${i === reel ? 'on' : ''}`}><Mark svg={m.svg} size={72} /><span>{m.name}</span></div>)}</div>}
              <span className="dim-layer" />
            </div>
          </article>
        ))}
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
