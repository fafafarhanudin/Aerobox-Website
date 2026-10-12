import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

/* A little gang of kittens living on the top edge of a card. Each one creeps in from a side, sits and looks
   around, wanders or rolls over now and then. Some love being petted: point at one and it closes its eyes and
   nuzzles, tap again and it rolls onto its back, but poke it too often and it bolts. The shy ones bolt at once,
   then creep back a few seconds later.
   Frames: one sprite sheet per coat (public/cats/<coat>.webp, made with sprite-gen), 4 columns, rows in
   STATES order, every cell standing on one ground line. */
type State = 'idle' | 'happy' | 'roll' | 'scared' | 'sneak'
const STATES: State[] = ['idle', 'happy', 'roll', 'scared', 'sneak']
const FPS: Record<State, number> = { idle: 4, happy: 5, roll: 6, scared: 12, sneak: 6 }
const COLS = 4
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

type Cat = { coat: string; size: number; delay: number; likes: boolean }
// size is the square cell in px (the cat fills ~85 % of it); likes = enjoys being petted
const GANG: Cat[] = [
  { coat: 'oren', size: 100, delay: 900, likes: true },
  { coat: 'abu', size: 84, delay: 2600, likes: false },
  { coat: 'telon', size: 76, delay: 4300, likes: true },
  { coat: 'sapi', size: 90, delay: 6000, likes: false },
]

export function EdgeCats() {
  const zone = useRef<HTMLDivElement>(null)
  // the sheets only load once the card is near the screen
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = zone.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: '400px' })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <div className="kitty-zone" ref={zone} aria-hidden>{near && GANG.map((c, i) => <Kitty key={c.coat} zone={zone} lane={i} {...c} />)}</div>
}

function Kitty({ zone, lane, coat, size, delay, likes }: Cat & { zone: React.RefObject<HTMLDivElement | null>; lane: number }) {
  const [state, setState] = useState<State>('sneak')
  const [shown, setShown] = useState(false)
  const [x, setX] = useState(-size); const [dir, setDir] = useState<1 | -1>(1); const [dur, setDur] = useState(0)
  const [frame, setFrame] = useState(0); const [hearts, setHearts] = useState(0)
  const timer = useRef(0); const xRef = useRef(-size); xRef.current = x
  const self = useRef<HTMLDivElement>(null); const pets = useRef<number[]>([])
  const later = (ms: number, f: () => void) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(f, ms) }
  const width = () => zone.current?.clientWidth ?? 800
  // while walking, state x is the destination; read where the cat really is right now
  const here = () => {
    const el = self.current, z = zone.current
    return el && z ? el.getBoundingClientRect().left - z.getBoundingClientRect().left : xRef.current
  }

  // frame clock: loops for everything but the roll, which plays once and stays on its last pose
  useEffect(() => {
    setFrame(0)
    if (!shown || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setFrame(f => (state === 'roll' ? Math.min(f + 1, COLS - 1) : (f + 1) % COLS)), 1000 / FPS[state])
    return () => window.clearInterval(id)
  }, [state, shown])

  const walkTo = useCallback((to: number, speed: number, s: State, then: () => void) => {
    const from = here(), d = Math.max(.3, Math.abs(to - from) / speed)
    xRef.current = from; setDir(to >= from ? 1 : -1); setState(s); setDur(0); setX(from)
    requestAnimationFrame(() => requestAnimationFrame(() => { setDur(d); setX(to) }))
    later(d * 1000, then)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sit = useCallback(() => {
    setState('idle'); setDur(0)
    later(rnd(4000, 8000), () => {
      const r = Math.random()
      if (r < .45) wander()
      else if (r < .65) { setState('roll'); later(rnd(2200, 3200), sit) }
      else sit()
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const wander = useCallback(() => {
    const W = width(), from = here()
    let to = rnd(10, W - size - 10); if (Math.abs(to - from) < 90) to = from < W / 2 ? Math.min(W - size - 10, from + 180) : Math.max(10, from - 180)
    walkTo(to, 55, 'sneak', sit)
  }, [walkTo, sit]) // eslint-disable-line react-hooks/exhaustive-deps
  // creep in carefully from one side. The first time, each cat takes its own lane and the sides alternate,
  // so the gang spreads along the edge instead of walking in single file; later returns are random.
  const first = useRef(true)
  const enter = useCallback(() => {
    const W = width(), N = GANG.length
    const left = first.current ? lane % 2 === 0 : Math.random() < .5, start = left ? -size : W
    const to = first.current ? (W * (lane + .5)) / N - size / 2 + rnd(-24, 24) : left ? rnd(20, W * .45) : rnd(W * .45, W - size - 20)
    first.current = false
    xRef.current = start; setX(start); setDur(0); setShown(true)
    walkTo(Math.min(Math.max(to, 10), W - size - 10), 50, 'sneak', sit)
  }, [walkTo, sit]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setX(width() * (.12 + delay / 9000)); setShown(true); setState('idle'); return }
    later(delay, enter); return () => window.clearTimeout(timer.current)
  }, [enter]) // eslint-disable-line react-hooks/exhaustive-deps

  const flee = (clientX: number) => {
    if (state === 'scared') return
    const z = zone.current!.getBoundingClientRect(), now = here(), away = clientX < z.left + now + size / 2 ? 1 : -1
    setHearts(0); walkTo(away === 1 ? width() + 20 : -size - 20, 420, 'scared', () => { setShown(false); later(rnd(3500, 6000), enter) })
  }
  const settle = () => { const at = here(); xRef.current = at; setDur(0); setX(at) }
  const onEnter = (e: React.PointerEvent) => {
    if (!shown || state === 'scared') return
    if (!likes) return flee(e.clientX)
    if (state === 'sneak') settle()
    setState('happy'); setHearts(h => h + 1); later(60000, sit)
  }
  const onLeave = () => { if (likes && (state === 'happy' || state === 'roll')) later(900, sit) }
  const onPoke = (e: React.MouseEvent) => {
    if (!shown || state === 'scared') return
    if (!likes) return flee(e.clientX)
    // a pet or two is lovely; three pokes in quick succession is too much
    const t = performance.now(); pets.current = [...pets.current.filter(p => t - p < 2500), t]
    if (pets.current.length >= 3) { pets.current = []; return flee(e.clientX) }
    if (state === 'sneak') settle()
    setHearts(h => h + 1); later(60000, sit)
    if (pets.current.length === 2) { setState('roll'); later(2800, () => setState('happy')) } else setState('happy')
  }

  const row = STATES.indexOf(state)
  return (
    <div ref={self} className={`kitty kitty-${state} ${shown ? '' : 'is-away'}`} style={{ width: size, height: size, transform: `translateX(${x}px)`, transitionDuration: `${dur}s` }}
      onPointerEnter={onEnter} onPointerLeave={onLeave} onClick={onPoke}>
      <span className="kitty-body" style={{
        backgroundImage: `url(/library/cats/${coat}.webp)`, backgroundSize: `${COLS * size}px ${STATES.length * size}px`,
        backgroundPosition: `${-frame * size}px ${-row * size}px`, transform: `scaleX(${dir})`,
      }} />
      {state === 'scared' && <span className="kitty-alert">!</span>}
      {state === 'happy' && hearts > 0 && <span key={hearts} className="kitty-hearts"><Heart /><Heart /><Heart /></span>}
    </div>
  )
}

const Heart = () => <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.2 0 3.6 1.2 4.3 2.4h2c.7-1.2 2.1-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21Z" fill="#FF5E7A" /></svg>
