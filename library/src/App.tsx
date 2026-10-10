import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrandMark, Icon, Modal, ToastProvider, Tooltip, XLogo, Key, Legend } from './ui'
import { ShareModal, SupportModal } from './share'
import { COLORS, pop } from './lib/confetti'
import { RequestProvider } from './request'
import { BRAND, NavLogo } from './logo'
import { EdgeCats } from './cat'
import { ICONS } from './data/icons'
import { GRADIENTS } from './data/gradients'
import { MARKS } from './data/logos'
import Home from './pages/Home'
import IconsPage from './pages/Icons'
import GradientsPage from './pages/Gradients'
import LogosPage from './pages/Logos'
import IsoPage from './pages/Iso'
import SponsorPage from './pages/Sponsor'

export type Route = 'home' | 'icons' | 'gradients' | 'logos' | 'isometric' | 'sponsor'
const ROUTES: Route[] = ['home', 'icons', 'gradients', 'logos', 'isometric', 'sponsor']
const readRoute = (): { route: Route; q: string } => {
  const [p, q] = location.hash.replace(/^#\/?/, '').split('?')
  return { route: (ROUTES.includes(p as Route) ? p : 'home') as Route, q: new URLSearchParams(q).get('q') ?? '' }
}
export const go = (r: Route, q = '') => { location.hash = `/${r === 'home' ? '' : r}${q ? `?q=${encodeURIComponent(q)}` : ''}` }

export type Modals = { share: () => void; support: () => void; palette: () => void }

export default function App() {
  const [{ route, q }, setR] = useState(readRoute())
  const [share, setShare] = useState(false); const [support, setSupport] = useState(false); const [palette, setPalette] = useState(false)
  useEffect(() => {
    const on = () => { setR(readRoute()); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }
    addEventListener('hashchange', on); return () => removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p) } }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  const modals: Modals = useMemo(() => ({ share: () => setShare(true), support: () => setSupport(true), palette: () => setPalette(true) }), [])
  return (
    <ToastProvider><RequestProvider>
      <div className="shell">
      <Nav route={route} modals={modals} />
      <main key={route} className="page-enter">
        {route === 'home' && <Home modals={modals} />}
        {route === 'icons' && <IconsPage initialQuery={q} />}
        {route === 'gradients' && <GradientsPage />}
        {route === 'logos' && <LogosPage />}
        {route === 'isometric' && <IsoPage />}
        {route === 'sponsor' && <SponsorPage />}
      </main>
      <Footer modals={modals} route={route} />
      </div>
      <ShareModal open={share} onClose={() => setShare(false)} />
      <SupportModal open={support} onClose={() => setSupport(false)} />
      <Palette open={palette} onClose={() => setPalette(false)} />
    </RequestProvider></ToastProvider>
  )
}

/* ---------------- Nav ---------------- */
function Nav({ route, modals }: { route: Route; modals: Modals }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const s = () => setScrolled(scrollY > 8); addEventListener('scroll', s, { passive: true }); return () => removeEventListener('scroll', s) }, [])
  const links: [Route | null, string, string?][] = [['icons', 'Icons', String(ICONS.length)], ['gradients', 'Gradients'], ['logos', 'Logos'], ['isometric', 'Isometric'], [null, 'Patterns'], [null, 'Illustrations']]
  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-left">
        <span className="brand">
          <Tooltip label="Open the gift" side="bottom"><NavLogo /></Tooltip>
          <a href="#/">{BRAND}</a>
        </span>
        <nav className="nav-links" aria-label="Primary">
          {links.map(([r, label, badge]) => r ? (
            <a key={label} href={`#/${r}`} className={`nav-link ${route === r ? 'active' : ''}`} aria-current={route === r ? 'page' : undefined}>{label}{badge && <span className="badge">{badge}</span>}</a>
          ) : (
            <Tooltip key={label} label="Coming soon" side="bottom"><span className="nav-link is-soon">{label}</span></Tooltip>
          ))}
        </nav>
      </div>
      <button className="nav-pill" onClick={modals.palette} aria-label="Search assets"><Icon name="search" size={16} /><span>Search assets…</span><kbd>⌘K</kbd></button>
      <div className="nav-right">
        <Tooltip label="Share Aerobox Assets on X" side="bottom">
          <Key size="sm" onClick={modals.share}><XLogo size={13} /> Share on X</Key>
        </Tooltip>
        <span className="divider" />
        <Key variant="primary" size="sm" onClick={modals.support}>Support <Legend><Icon name="heart" size={12} color="#FF6B81" stroke={2} /></Legend></Key>
      </div>
    </header>
  )
}

/* ---------------- Footer ---------------- */
const SOCIALS: [string, string, string][] = [
  ['x', 'X', 'https://x.com/UI_Farhan'], ['dribbble', 'Dribbble', 'https://dribbble.com/muhammadfarhanudin'], ['behance', 'Behance', 'https://www.behance.net/Muhammadfarhanudin'],
  ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/muhammadfarhanudin/'], ['contra', 'Contra', 'https://contra.com/Muhammadfarhanudin'],
]
function LocalTime() {
  const fmt = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
  const [t, setT] = useState(fmt); useEffect(() => { const id = window.setInterval(() => setT(fmt()), 15000); return () => window.clearInterval(id) }, [])
  return <b className="mono">{t}</b>
}
function Footer({ modals, route }: { modals: Modals; route: Route }) {
  return (
    <footer className={`footer ${route === 'sponsor' ? 'no-cta' : ''}`}>
      <FooterConfetti />
      {route !== 'sponsor' && <div className="footer-cta">
        <EdgeCats />
        <div>
          <span className="ph-chip"><Icon name="star" size={13} />Sponsorship</span>
          <h3>Keep Aerobox Assets free for everyone</h3>
          <p>Sponsors fund new icons, gradients and templates every week. Put your product in front of the designers and developers who use them.</p>
        </div>
        <div className="footer-cta-actions">
          <Key onClick={e => { pop(e.currentTarget, 18); modals.support() }}><Icon name="heart" size={16} /> Support</Key>
          <Key variant="primary" href="#/sponsor" onClick={e => pop(e.currentTarget, 28)}><Icon name="star" size={16} color="#FFD25A" /> Become a sponsor</Key>
        </div>
      </div>}
      <div className="footer-top">
        <div className="footer-brand">
          <a className="brand" href="#/"><BrandMark size={28} /><span>Aerobox Assets</span></a>
          <p>Free icons, gradients, logos and isometric scenes.<br />Drawn in Indonesia, shared with everyone.</p>
          <div className="ft-status">
            <a className="ft-avatar" href={SOCIALS[0][2]} target="_blank" rel="noreferrer" aria-label="Farhan on X"><img src="/library/farhan.png" alt="" width={30} height={30} /></a>
            <span className="ft-pill"><i />Made by <b>Farhan</b> · updated weekly</span>
          </div>
        </div>
        <div className="footer-cols">
          <nav aria-label="Library"><b>Library</b><a href="#/icons">Icons</a><a href="#/gradients">Gradients</a><a href="#/logos">Logos</a><a href="#/isometric">Isometric</a><a href="#/#faq" onClick={e => { e.preventDefault(); go('home'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 80) }}>FAQ</a></nav>
          <div><b>Resources</b><button onClick={modals.share}>Share on X</button><button onClick={modals.support}>Support Aerobox Assets</button><a href="#/sponsor">Become a sponsor</a></div>
          <div><b>Connect</b>{SOCIALS.map(([k, label, href]) => <a key={k} href={href} target="_blank" rel="noreferrer" className="ft-social">{k === 'x' ? <XLogo size={13} /> : <Icon name="arrow-up-right" size={14} />}{label}</a>)}</div>
          <div className="ft-contact"><b>Contact</b>
            <a href="https://t.me/hanwork12345" target="_blank" rel="noreferrer"><span>Telegram</span><small>@hanwork12345</small></a>
            <a href="mailto:farhanwork.2009@gmail.com"><span>Email</span><small>farhanwork.2009@gmail.com</small></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Aerobox Assets. Designed and built by <a href={SOCIALS[0][2]} target="_blank" rel="noreferrer">Farhan</a>.</span>
        <div className="row"><span className="ft-time">Local time in Indonesia <LocalTime /> GMT+7</span><Key size="sm" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}><Icon name="arrow-up" size={14} /> Back to top</Key></div>
      </div>
      <div className="ft-wordmark" aria-hidden>
        <svg viewBox="0 0 1000 120"><defs><linearGradient id="ftw" x1="0" x2="1"><stop offset="0" stopColor="#2F6BFF" /><stop offset=".5" stopColor="#7A5AF8" /><stop offset="1" stopColor="#EC4899" /></linearGradient></defs>
          {['base', 'trace', 'trace t2'].map(c => <text key={c} className={`ftw-${c}`} x="500" y="168" textAnchor="middle" textLength="988" lengthAdjust="spacing">AEROBOX</text>)}</svg>
        <span className="ft-sign">Assets, by Farhan</span>
      </div>
    </footer>
  )
}

/* confetti fountains behind the footer: a small burst shoots up from the bottom every few seconds, then flutters back down.
   Runs only while the footer is on screen and never for reduced motion. */
function FooterConfetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current, host = cv?.parentElement, ctx = cv?.getContext('2d')
    if (!cv || !host || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    type Q = { x: number; y: number; vx: number; vy: number; term: number; s: number; rot: number; vr: number; tilt: number; vt: number; c: string; k: number }
    const G = .16, MAX = 60
    let W = 0, H = 0, raf = 0, last = 0, next = 0, side = 0
    const ps: Q[] = []
    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2); W = host.clientWidth; H = host.clientHeight
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const burst = () => {
      side ^= 1
      const x0 = W * (side ? .1 + Math.random() * .3 : .6 + Math.random() * .3), n = 10 + ((Math.random() * 6) | 0)
      for (let i = 0; i < n && ps.length < MAX; i++) {
        const a = (-90 + (Math.random() - .5) * 44) * Math.PI / 180, v = Math.sqrt(2 * G * H * (.5 + Math.random() * .38)) * 1.08
        ps.push({ x: x0 + (Math.random() - .5) * 24, y: H + 8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, term: 1.3 + Math.random() * 1.1,
          s: 6 + Math.random() * 5, rot: Math.random() * 6.28, vr: (Math.random() - .5) * .16, tilt: Math.random() * 6.28, vt: .05 + Math.random() * .08,
          c: COLORS[(Math.random() * COLORS.length) | 0], k: Math.random() })
      }
    }
    const draw = (p: Q) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, Math.min(1, (H - p.y) / 70)) * .92; ctx.fillStyle = p.c
      if (p.k < .5) { ctx.scale(1, Math.cos(p.tilt)); ctx.fillRect(-p.s / 2, -p.s * .32, p.s, p.s * .64) }
      else if (p.k < .78) { ctx.beginPath(); ctx.arc(0, 0, p.s * .38, 0, 6.28); ctx.fill() }
      else if (p.k < .93) { ctx.scale(Math.cos(p.tilt), 1); ctx.fillRect(-p.s * .16, -p.s * .9, p.s * .32, p.s * 1.8) }
      else { ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? p.s * .3 : p.s * .7, a = -1.5708 + i * .6283; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) } ctx.fill() }
      ctx.restore()
    }
    const tick = (t: number) => {
      const dt = last ? Math.min(3, (t - last) / 16.7) : 1; last = t
      if (t >= next) { burst(); next = t + 2600 + Math.random() * 1400 }
      ctx.clearRect(0, 0, W, H)
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.vx *= .985; p.vy = Math.min(p.vy + G * dt, p.term)          // rise, then flutter down like paper
        const falling = p.vy > 0
        p.x += (p.vx + (falling ? Math.sin(p.tilt) * .7 : 0)) * dt; p.y += p.vy * dt
        p.rot += p.vr * dt; p.tilt += p.vt * dt
        if (falling && p.y > H + 16) { ps.splice(i, 1); continue }
        draw(p)
      }
      raf = requestAnimationFrame(tick)
    }
    const start = () => { if (!raf) { last = 0; next = 0; raf = requestAnimationFrame(tick) } }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(host)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())); io.observe(host)
    const vis = () => (document.hidden ? stop() : host.getBoundingClientRect().top < innerHeight && start()); document.addEventListener('visibilitychange', vis)
    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', vis) }
  }, [])
  return <canvas ref={ref} className="footer-confetti" aria-hidden />
}

/* ---------------- ⌘K palette ---------------- */
function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState(''); const [i, setI] = useState(0); const inp = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) { setQ(''); setI(0); setTimeout(() => inp.current?.focus(), 60) } }, [open])
  type Hit = { kind: string; label: string; icon?: string; swatch?: string; run: () => void }
  const hits: Hit[] = useMemo(() => {
    const s = q.trim().toLowerCase()
    const pages: Hit[] = (['icons', 'gradients', 'logos', 'isometric'] as Route[]).map(r => ({ kind: 'Page', label: r[0].toUpperCase() + r.slice(1), icon: 'arrow-right', run: () => go(r) }))
    if (!s) return pages
    return [
      ...pages.filter(p => p.label.toLowerCase().includes(s)),
      ...ICONS.filter(x => x.name.includes(s)).slice(0, 6).map(x => ({ kind: 'Icon', label: x.name, icon: x.name, run: () => go('icons', x.name) })),
      ...GRADIENTS.filter(x => x.name.toLowerCase().includes(s)).slice(0, 4).map(x => ({ kind: 'Gradient', label: x.name, swatch: x.css, run: () => go('gradients') })),
      ...MARKS.filter(x => x.name.toLowerCase().includes(s)).slice(0, 4).map(x => ({ kind: 'Logo', label: x.name, icon: 'star', run: () => go('logos') })),
    ]
  }, [q])
  const run = (h?: Hit) => { if (!h) return; h.run(); onClose() }
  return (
    <Modal open={open} onClose={onClose} label="Search" width={560}>
      <div className="cmdk">
        <div className="palette-input"><Icon name="search" size={18} /><input ref={inp} value={q} placeholder="Search icons, gradients, logos…" onChange={e => { setQ(e.target.value); setI(0) }}
          onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setI(v => Math.min(v + 1, hits.length - 1)) } if (e.key === 'ArrowUp') { e.preventDefault(); setI(v => Math.max(v - 1, 0)) } if (e.key === 'Enter') run(hits[i]) }} /><kbd>esc</kbd></div>
        <div className="palette-list">
          {hits.length === 0 && <div className="palette-empty">No matches for “{q}”</div>}
          {hits.map((h, k) => (
            <button key={h.kind + h.label} className={`palette-item ${k === i ? 'on' : ''}`} onMouseEnter={() => setI(k)} onClick={() => run(h)}>
              <span className="pi-ic">{h.swatch ? <span className="pi-sw" style={{ background: h.swatch }} /> : <Icon name={h.icon!} size={18} />}</span>
              <span className="pi-label">{h.label}</span><span className="pi-kind">{h.kind}</span>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

