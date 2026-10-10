import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

/* A little gang of cats living on the top edge of a card. Each one peeks from behind the edge, hops along it
   and sits for a while; point at one or click it and it gets a fright and bolts off the side, then sneaks back. */
type Mode = 'gone' | 'peek' | 'hop' | 'sit' | 'run'
const RATIO = 218 / 300 // cat.png width / height
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

// size (px tall), coat filter and how long it waits before first showing up
const GANG: { h: number; coat: string; delay: number }[] = [
  { h: 86, coat: 'none', delay: 900 },
  { h: 70, coat: 'grayscale(1) brightness(1.08) contrast(1.05)', delay: 2600 },
  { h: 62, coat: 'saturate(.55) brightness(1.18)', delay: 4300 },
  { h: 74, coat: 'saturate(1.25) brightness(.82)', delay: 6000 },
]

export function EdgeCats() {
  const zone = useRef<HTMLDivElement>(null)
  return <div className="kitty-zone" ref={zone} aria-hidden>{GANG.map((c, i) => <Kitty key={i} zone={zone} {...c} />)}</div>
}

function Kitty({ zone, h, coat, delay }: { zone: React.RefObject<HTMLDivElement | null>; h: number; coat: string; delay: number }) {
  const w = Math.round(h * RATIO)
  const [mode, setMode] = useState<Mode>('gone')
  const [x, setX] = useState(0); const [dir, setDir] = useState<1 | -1>(1); const [dur, setDur] = useState(0)
  const timer = useRef(0); const xRef = useRef(0); xRef.current = x
  const later = (ms: number, f: () => void) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(f, ms) }
  const width = () => zone.current?.clientWidth ?? 800

  const hop = useCallback(() => {
    const W = width(), from = xRef.current
    let to = rnd(20, W - w - 20); if (Math.abs(to - from) < 100) to = from < W / 2 ? Math.min(W - w - 20, from + 200) : Math.max(20, from - 200)
    const d = Math.abs(to - from) / 70
    setDir(to > from ? 1 : -1); setDur(d); setMode('hop'); setX(to)
    later(d * 1000, () => { setMode('sit'); later(rnd(3000, 5500), () => (Math.random() < .5 ? hop() : hide())) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const hide = useCallback(() => { setMode('gone'); later(rnd(3000, 7000), appear) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const appear = useCallback(() => {
    setDur(0); setX(rnd(20, width() - w - 20)); setMode('peek')
    later(rnd(3500, 6000), () => (Math.random() < .75 ? hop() : hide()))
  }, [hop]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setX(width() * (.15 + delay / 9000)); setMode('sit'); return }
    later(delay, appear); return () => window.clearTimeout(timer.current)
  }, [appear]) // eslint-disable-line react-hooks/exhaustive-deps

  const scare = (e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'run' || mode === 'gone') return
    // while hopping, state x is the destination; read where the cat really is right now
    const z = zone.current!.getBoundingClientRect(), c = e.currentTarget.getBoundingClientRect()
    const now = c.left - z.left, away: 1 | -1 = e.clientX < c.left + c.width / 2 ? 1 : -1
    const to = away === 1 ? width() + 30 : -w - 30, d = Math.max(.35, Math.abs(to - now) / 900)
    xRef.current = now; setDir(away); setDur(d); setMode('run'); setX(to)
    later(d * 1000 + 200, () => { setMode('gone'); later(rnd(3500, 6000), appear) })
  }

  return (
    <div className={`kitty kitty-${mode}`} style={{ transform: `translateX(${x}px)`, transitionDuration: `${dur}s`, width: w, height: h }} onPointerEnter={scare} onClick={scare}>
      <span className="kitty-body" style={{ ['--flip' as string]: dir }}>
        <img src="/library/cat.png" alt="" width={w} height={h} draggable={false} style={{ filter: coat === 'none' ? undefined : coat }} />
      </span>
      {mode === 'run' && <span className="kitty-alert">!</span>}
    </div>
  )
}
