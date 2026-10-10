import type React from 'react'
import { useMemo, useState } from 'react'
import { CloseButton, Icon, Key, Legend, Modal, Tooltip, copyText, useToast } from '../ui'
import { DkChips, DkRow, DkSlider, DkSwitch, DockDiv, DockPop, Formats, FloatDock, PageHead, PillTabs, Select, Summary, ViewToggle } from '../pagekit'
import { GRADIENTS, type Gradient } from '../data/gradients'
import { pop } from '../lib/confetti'
import { RequestKey, useRequest } from '../request'
import { gradientPng, tailwindOf } from '../lib/gradpng'

const KINDS = ['All', 'Linear', 'Radial', 'Mesh', 'Conic', 'Soft', 'New']
const SORTS = ['Popular', 'A–Z', 'Newest'] as const
const match = (g: Gradient, k: string) => k === 'All' || g.kind === k || (k === 'Soft' && g.tone === 'Soft') || (k === 'New' && !!g.new)

export type Grain = { on: boolean; amt: number; size: 'Fine' | 'Medium' | 'Coarse' }
const GRAIN_PX = { Fine: 120, Medium: 180, Coarse: 280 }
export function GradSwatch({ g, grain, blur, tune = '', className = '', style }: { g: Gradient; grain: boolean | Grain; blur: number; tune?: string; className?: string; style?: React.CSSProperties }) {
  const gr: Grain = typeof grain === 'boolean' ? { on: grain, amt: 32, size: 'Medium' } : grain
  const filter = `${blur ? `blur(${blur}px) saturate(1.05)` : ''} ${tune}`.trim()
  return (
    <div className={`grad ${className}`} style={style}>
      <div className="grad-fill" style={{ background: g.css, filter: filter || undefined, inset: blur ? -blur * 2 : 0 }} />
      {gr.on && gr.amt > 0 && g.tone === 'Grain' && <div className={`grain ${g.dark ? 'light' : ''}`} style={{ opacity: gr.amt / 100 * (g.dark ? .7 : 1), backgroundSize: `${GRAIN_PX[gr.size]}px` }} />}
    </div>
  )
}
const RATIOS = { '4:3': [1600, 1200], '16:9': [1920, 1080], '1:1': [1600, 1600], '3:4': [1200, 1600], '9:16': [1080, 1920] } as const
type Ratio = keyof typeof RATIOS

export default function GradientsPage() {
  const toast = useToast(); const request = useRequest()
  const [kind, setKind] = useState('All'); const [q, setQ] = useState(''); const [gr, setGr] = useState<Grain>({ on: true, amt: 32, size: 'Medium' }); const [blur, setBlur] = useState(0)
  const [hue, setHue] = useState(0); const [sat, setSat] = useState(100); const [bri, setBri] = useState(100); const [ratio, setRatio] = useState<Ratio>('4:3')
  const tune = `${hue ? `hue-rotate(${hue}deg)` : ''} ${sat !== 100 ? `saturate(${sat}%)` : ''} ${bri !== 100 ? `brightness(${bri}%)` : ''}`.replace(/\s+/g, ' ').trim()
  const [RW, RH] = RATIOS[ratio]
  const [sort, setSort] = useState<typeof SORTS[number]>('Popular'); const [view, setView] = useState<'grid' | 'list'>('grid'); const [sel, setSel] = useState<Gradient | null>(null); const [code, setCode] = useState<'CSS' | 'Tailwind'>('CSS')
  const list = useMemo(() => {
    let l = GRADIENTS.filter(g => match(g, kind) && g.name.toLowerCase().includes(q.toLowerCase()))
    if (sort === 'A–Z') l = [...l].sort((a, b) => a.name.localeCompare(b.name)); if (sort === 'Newest') l = [...l].reverse()
    return l
  }, [kind, q, sort])
  const idx = (g: Gradient) => String(GRADIENTS.indexOf(g) + 1).padStart(2, '0')
  const copyCss = async (g: Gradient, el: Element) => { await copyText(`background: ${g.css};${tune ? `\nfilter: ${tune};` : ''}`); pop(el, 20); toast(<>Copied <b>{g.name}</b> CSS</>) }
  const copyTw = async (g: Gradient, el: Element) => { await copyText(tailwindOf(g.css)); pop(el, 20); toast(<>Copied <b>{g.name}</b> Tailwind class</>) }
  const dlPng = async (g: Gradient, el: Element) => {
    toast(<>Rendering <b>{g.name}</b> · {RW}×{RH}</>)
    const blob = await gradientPng(g.css, { grain: on && g.tone === 'Grain', dark: g.dark, blur, W: RW, H: RH, tune, grainAmt: gr.amt })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${g.name.toLowerCase().replace(/\W+/g, '-')}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500)
    pop(el, 22); toast(<>Downloaded <b>{g.name}.png</b></>)
  }
  const on = gr.on
  return (
    <div className="page grad-page">
      <PageHead chip="Gradients" count={GRADIENTS.length} title="Gradients" desc="Smooth mesh, linear, radial and conic gradients with harmonious palettes and optional fine grain."
        action={<RequestKey kind="gradient" legend="G" />} />
      <Summary cells={[['Items', `${GRADIENTS.length} gradients`], ['Formats', <Formats list={['CSS', 'Tailwind', 'PNG']} />], ['Styles', 'Mesh · Linear · Radial · Conic'], ['License', 'Free for commercial use']]} />
      <div className="toolbar2">
        <label className="search sm"><Icon name="search" size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${GRADIENTS.length} gradients...`} /></label>
        <Select label="Sort" value={sort} options={[...SORTS]} onChange={setSort} />
        <ViewToggle value={view} onChange={setView} />
      </div>
      <PillTabs items={KINDS.map(k => [k, GRADIENTS.filter(g => match(g, k)).length])} value={kind} onChange={setKind} right={`Showing ${list.length} gradients`} />

      {view === 'grid' ? (
        <div className="grad-grid">
          {list.map((g, k) => (
            <article key={g.name} className="grad-card" style={{ ['--i' as string]: Math.min(k, 16) }} onClick={() => setSel(g)}>
              <div className="gc-preview" style={{ height: 'auto', aspectRatio: `${RW} / ${RH}` }}>
                <GradSwatch g={g} grain={gr} blur={blur} tune={tune} />
                {g.new && <span className="new-pill">New</span>}
                <div className="gc-actions" onClick={e => e.stopPropagation()}>
                  <Tooltip label="Open"><button className="gc-round" onClick={() => setSel(g)}><Icon name="expand" size={14} /></button></Tooltip>
                </div>
                <div className="gc-bar" onClick={e => e.stopPropagation()}>
                  <button onClick={e => copyCss(g, e.currentTarget)}><Icon name="copy" size={14} /> Copy gradient</button>
                  <button onClick={e => dlPng(g, e.currentTarget)}><Icon name="download" size={14} /> Download PNG</button>
                </div>
              </div>
              <div className="ic-cap">
                <div className="ic-title"><div><b>{g.name}</b><span className="dim">{g.kind} · {g.tone}</span></div><span className="mono dim">{idx(g)}</span></div>
                <div className="ic-meta"><Formats list={['CSS', 'Tailwind', 'PNG']} /><span className="palette">{g.colors.map(c => <i key={c} style={{ background: c }} />)}</span></div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="iso-list">
          {list.map((g, k) => (
            <div key={g.name} className="il-row grad-row" style={{ ['--i' as string]: Math.min(k, 16) }} onClick={() => setSel(g)}>
              <span className="mono dim">{idx(g)}</span>
              <span className="gl-thumb"><GradSwatch g={g} grain={gr} blur={0} tune={tune} /></span>
              <b>{g.name}</b><span className="dim">{g.kind} · {g.tone}</span>
              <span className="palette">{g.colors.map(c => <i key={c} style={{ background: c }} />)}</span>
              <span className="il-actions" onClick={e => e.stopPropagation()}><Key size="sm" onClick={e => copyCss(g, e.currentTarget)}><Icon name="copy" size={14} /> Copy</Key><Key size="sm" onClick={e => dlPng(g, e.currentTarget)}><Icon name="download" size={14} /> Download</Key></span>
            </div>
          ))}
        </div>
      )}
      {list.length === 0 && <div className="empty"><Icon name="search" size={28} /><b>No gradients match “{q}”</b></div>}
      <div className="request-row"><span>Need another palette?</span><Key onClick={e => { pop(e.currentTarget, 24); request('gradient') }}>Request a gradient <Legend>R</Legend></Key></div>

      <Modal open={!!sel} onClose={() => setSel(null)} label="Gradient" width={640}>
        {sel && <div className="grad-modal">
          <div className="im-head"><b>{sel.name}</b><span className="badge-n">{sel.kind}</span><span className="badge-n">{sel.tone}</span><CloseButton onClick={() => setSel(null)} /></div>
          <GradSwatch g={sel} grain={gr} blur={blur} tune={tune} className="big" style={{ aspectRatio: `${RW} / ${RH}`, height: 'auto', maxHeight: 360 }} />
          <div className="palette lg">{sel.colors.map(c => <Tooltip key={c} label="Copy hex"><button style={{ background: c }} onClick={async e => { const el = e.currentTarget; await copyText(c); pop(el, 14); toast(<>Copied <b>{c}</b></>) }} /></Tooltip>)}</div>
          <div className="code"><div className="code-tabs">{(['CSS', 'Tailwind'] as const).map(t => <button key={t} className={code === t ? 'on' : ''} onClick={() => setCode(t)}>{t}</button>)}<Tooltip label={`Copy ${code}`}><button className="code-copy" onClick={e => (code === 'CSS' ? copyCss : copyTw)(sel, e.currentTarget)}><Icon name="copy" size={14} /></button></Tooltip></div>
            <pre>{code === 'CSS' ? `background: ${sel.css.replace(/\), /g, '),\n  ')};` : tailwindOf(sel.css)}</pre></div>
          <div className="im-foot"><span className="mono dim">PNG · {RW}×{RH}{on && sel.tone === 'Grain' ? ' · with grain' : ''}{tune ? ' · adjusted' : ''}</span><div className="row">
            <Key onClick={e => copyCss(sel, e.currentTarget)}><Icon name="copy" size={15} /> Copy gradient</Key>
            <Key variant="primary" onClick={e => dlPng(sel, e.currentTarget)}><Icon name="download" size={15} /> Download PNG</Key>
          </div></div>
        </div>}
      </Modal>
      <FloatDock>
        <DockPop id="grain" label="Grain" value={gr.on ? `${gr.amt}%` : 'Off'} icon={<Icon name="sparkle" size={15} color="#fff" />}>
          <DkRow label="Grain"><DkSwitch on={gr.on} onChange={v => setGr(x => ({ ...x, on: v }))} /></DkRow>
          <DkRow label="Intensity"><DkSlider value={gr.amt} min={0} max={80} onChange={v => setGr(x => ({ ...x, amt: v, on: true }))} unit="%" /></DkRow>
          <DkRow label="Size"><DkChips options={['Fine', 'Medium', 'Coarse'] as const} value={gr.size} onChange={v => setGr(x => ({ ...x, size: v, on: true }))} /></DkRow>
          <p className="dk-note">Fine film grain on the Grain gradients. Soft gradients stay clean.</p>
        </DockPop>
        <DockDiv />
        <DockPop id="blur" label="Blur" value={`${blur}px`} icon={<Icon name="droplet" size={15} color="#fff" />}>
          <DkRow label="Blur"><DkSlider value={blur} min={0} max={24} onChange={setBlur} unit="px" /></DkRow>
          <DkRow label="Presets"><DkChips options={[0, 4, 8, 16, 24]} value={blur} onChange={setBlur} render={v => `${v}`} /></DkRow>
        </DockPop>
        <DockDiv />
        <DockPop id="tune" label="Adjust" value={tune ? 'Custom' : 'Original'} icon={<Icon name="palette" size={15} color="#fff" />} width={290}>
          <DkRow label="Hue"><DkSlider value={hue} min={-180} max={180} step={5} onChange={setHue} unit="°" /></DkRow>
          <DkRow label="Saturation"><DkSlider value={sat} min={40} max={160} step={5} onChange={setSat} unit="%" /></DkRow>
          <DkRow label="Brightness"><DkSlider value={bri} min={70} max={130} step={5} onChange={setBri} unit="%" /></DkRow>
          <button className="dk-reset" onClick={() => { setHue(0); setSat(100); setBri(100) }}>Reset</button>
        </DockPop>
        <DockDiv />
        <DockPop id="ratio" label="Ratio" value={ratio} icon={<Icon name="crop" size={15} color="#fff" />}>
          <DkRow label="Preview & PNG"><DkChips options={Object.keys(RATIOS) as Ratio[]} value={ratio} onChange={setRatio} /></DkRow>
          <p className="dk-note">PNG export: {RW}×{RH}px</p>
        </DockPop>
      </FloatDock>
    </div>
  )
}
