import type React from 'react'
import { useMemo, useState } from 'react'
import { CloseButton, Icon, Key, Legend, Modal, Tooltip, copyText, useToast } from '../ui'
import { DkChips, DkColorField, DkHead, DkRow, DkSelect, DkSlider, DkSwitch, DockDiv, DockPop, Formats, FloatDock, PageHead, PillTabs, Select, Summary, ViewToggle } from '../pagekit'
import { GRADIENTS, type Gradient } from '../data/gradients'
import { pop } from '../lib/confetti'
import { RequestKey, useRequest } from '../request'
import { gradientPng, tailwindOf } from '../lib/gradpng'
import { DITHER_DEFAULT, DITHER_FILTER_ID, DITHER_STYLES, ditherFilterMarkup, type Dither } from '../lib/dither'
import { GRAD_MOTIONS, GRAD_MOTION_NOTE, GRAD_SPEEDS, animName, gradientVideo, keyframes, motionSnippet, type GradMotion } from '../lib/gradmotion'

const KINDS = ['All', 'Linear', 'Radial', 'Mesh', 'Conic', 'Soft', 'New']
const SORTS = ['Popular', 'A–Z', 'Newest'] as const
const match = (g: Gradient, k: string) => k === 'All' || g.kind === k || (k === 'Soft' && g.tone === 'Soft') || (k === 'New' && !!g.new)

/* Blur: 16 px is the house default — soft enough to read as light, sharp enough to keep the palette */
export const BLUR_DEFAULT = 16
const BLUR_PRESETS = [0, 8, 16, 24, 32]

export type Grain = { on: boolean; amt: number; size: 'Fine' | 'Medium' | 'Coarse' }
const GRAIN_PX = { Fine: 120, Medium: 180, Coarse: 280 }
export function GradSwatch({ g, grain, blur, tune = '', dither = false, motion, delay = 0, className = '', style }: { g: Gradient; grain: boolean | Grain; blur: number; tune?: string; dither?: boolean; motion?: GradMotion; delay?: number; className?: string; style?: React.CSSProperties }) {
  const gr: Grain = typeof grain === 'boolean' ? { on: grain, amt: 32, size: 'Medium' } : grain
  const filter = `${blur ? `blur(${blur}px) saturate(1.05)` : ''} ${tune}`.trim()
  const moving = !!motion && motion.kind !== 'None'
  return (
    // dither sits on the still frame, so its dot grid stays crisp while the colours move underneath
    <div className={`grad ${dither ? 'is-dither' : ''} ${moving ? 'is-moving' : ''} ${className}`} style={{ ...style, filter: dither ? `url(#${DITHER_FILTER_ID})` : undefined }}>
      <div className="grad-fill" style={{ background: g.css, filter: filter || undefined, inset: blur ? -blur * 2 : 0, animation: moving ? `${animName(motion!.kind)} ${motion!.dur}s linear ${-delay}s infinite` : undefined }} />
      {!dither && gr.on && gr.amt > 0 && g.tone === 'Grain' && <div className={`grain ${g.dark ? 'light' : ''}`} style={{ opacity: gr.amt / 100 * (g.dark ? .7 : 1), backgroundSize: `${GRAIN_PX[gr.size]}px` }} />}
    </div>
  )
}
const RATIOS = { '4:3': [1600, 1200], '16:9': [1920, 1080], '1:1': [1600, 1600], '3:4': [1200, 1600], '9:16': [1080, 1920] } as const
type Ratio = keyof typeof RATIOS
/** the Bayer cell in export pixels: the preview cell scaled to the export width (cards are ~480 px wide) */
const exportCell = (size: number, W: number) => Math.max(1, Math.round(size * W / 480))

export default function GradientsPage() {
  const toast = useToast(); const request = useRequest()
  const [kind, setKind] = useState('All'); const [q, setQ] = useState(''); const [gr, setGr] = useState<Grain>({ on: true, amt: 32, size: 'Medium' }); const [blur, setBlur] = useState(BLUR_DEFAULT)
  const [hue, setHue] = useState(0); const [sat, setSat] = useState(100); const [bri, setBri] = useState(100); const [ratio, setRatio] = useState<Ratio>('4:3')
  const [dither, setDither] = useState<Dither>(DITHER_DEFAULT); const dz = (p: Partial<Dither>) => setDither(d => ({ ...d, ...p, on: true }))
  const [motion, setMotion] = useState<GradMotion>({ kind: 'None', dur: 10 }); const moving = motion.kind !== 'None'
  const [rec, setRec] = useState<{ name: string; p: number } | null>(null)
  const tune = `${hue ? `hue-rotate(${hue}deg)` : ''} ${sat !== 100 ? `saturate(${sat}%)` : ''} ${bri !== 100 ? `brightness(${bri}%)` : ''}`.replace(/\s+/g, ' ').trim()
  const fillFilter = `${blur ? `blur(${blur}px) saturate(1.05)` : ''} ${tune}`.trim()
  const [RW, RH] = RATIOS[ratio]
  const [sort, setSort] = useState<typeof SORTS[number]>('Popular'); const [view, setView] = useState<'grid' | 'list'>('grid'); const [sel, setSel] = useState<Gradient | null>(null); const [code, setCode] = useState<'CSS' | 'Tailwind'>('CSS')
  const list = useMemo(() => {
    let l = GRADIENTS.filter(g => match(g, kind) && g.name.toLowerCase().includes(q.toLowerCase()))
    if (sort === 'A–Z') l = [...l].sort((a, b) => a.name.localeCompare(b.name)); if (sort === 'Newest') l = [...l].reverse()
    return l
  }, [kind, q, sort])
  const idx = (g: Gradient) => String(GRADIENTS.indexOf(g) + 1).padStart(2, '0')
  const ditherSvg = dither.on ? `<svg width="0" height="0" style="position:absolute">${ditherFilterMarkup(dither)}</svg>` : ''
  const cssOf = (g: Gradient) => (moving ? motionSnippet(g.css, motion, fillFilter) : `background: ${g.css};${fillFilter ? `\nfilter: ${fillFilter};` : ''}`) +
    (dither.on ? `\n\n/* Dither (Bayer ${dither.style}×${dither.style}): put this SVG once in the page, then add\n   filter: url(#${DITHER_FILTER_ID}); to the element that holds the gradient */\n${ditherSvg}` : '')
  const copyCss = async (g: Gradient, el: Element) => { await copyText(cssOf(g)); pop(el, 20); toast(<>Copied <b>{g.name}</b> CSS{moving ? ' · animated' : ''}{dither.on ? ' · dither' : ''}</>) }
  const copyTw = async (g: Gradient, el: Element) => { await copyText(tailwindOf(g.css)); pop(el, 20); toast(<>Copied <b>{g.name}</b> Tailwind class</>) }
  const save = (blob: Blob, name: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500) }
  const slug = (g: Gradient) => g.name.toLowerCase().replace(/\W+/g, '-')
  const dlPng = async (g: Gradient, el: Element) => {
    toast(<>Rendering <b>{g.name}</b> · {RW}×{RH}</>)
    const blob = await gradientPng(g.css, { grain: on && g.tone === 'Grain', dark: g.dark, blur, W: RW, H: RH, tune, grainAmt: gr.amt, dither, ditherCell: exportCell(dither.size, RW) })
    save(blob, `${slug(g)}.png`); pop(el, 22); toast(<>Downloaded <b>{g.name}.png</b></>)
  }
  const dlVideo = async (g: Gradient, el: Element) => {
    if (rec) return
    // videos stay ≤ 1280 px on the long side so recording keeps up in real time
    const k = Math.min(1, 1280 / Math.max(RW, RH)), W = Math.round(RW * k / 2) * 2, H = Math.round(RH * k / 2) * 2
    setRec({ name: g.name, p: 0 }); toast(<>Recording <b>{g.name}</b> · {motion.dur}s loop</>)
    try {
      const { blob, ext } = await gradientVideo(g.css, { W, H, blur, tune, motion, dither, ditherCell: exportCell(dither.size, W), onProgress: p => setRec({ name: g.name, p }) })
      save(blob, `${slug(g)}-${motion.kind.toLowerCase()}.${ext}`); pop(el, 26); toast(<>Downloaded <b>{g.name}</b> · {W}×{H} {ext.toUpperCase()}</>)
    } catch (e) { toast((e as Error).message) } finally { setRec(null) }
  }
  const on = gr.on
  const delayOf = (k: number) => (k * 1.37) % motion.dur
  return (
    <div className="page grad-page">
      {/* shared preview machinery: the dither filter + keyframes of the chosen motion */}
      {dither.on && <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden dangerouslySetInnerHTML={{ __html: ditherFilterMarkup(dither) }} />}
      {moving && <style>{keyframes(motion.kind, animName(motion.kind), fillFilter)}</style>}
      <PageHead chip="Gradients" count={GRADIENTS.length} title="Gradients" desc="Smooth mesh, linear, radial and conic gradients with harmonious palettes, optional fine grain or dither, and gentle motion."
        action={<RequestKey kind="gradient" legend="G" />} />
      <Summary cells={[['Items', `${GRADIENTS.length} gradients`], ['Formats', <Formats list={['CSS', 'Tailwind', 'PNG', 'Video']} />], ['Styles', 'Mesh · Linear · Radial · Conic'], ['License', 'Free for commercial use']]} />
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
                <GradSwatch g={g} grain={gr} blur={blur} tune={tune} dither={dither.on} motion={motion} delay={delayOf(k)} />
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
              <span className="gl-thumb"><GradSwatch g={g} grain={gr} blur={0} tune={tune} dither={dither.on} motion={motion} delay={delayOf(k)} /></span>
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
          <div className="im-head"><b>{sel.name}</b><span className="badge-n">{sel.kind}</span><span className="badge-n">{sel.tone}</span>{moving && <span className="badge-n">{motion.kind} · {motion.dur}s</span>}{dither.on && <span className="badge-n">Dither {dither.style}×{dither.style}</span>}<CloseButton onClick={() => setSel(null)} /></div>
          <div style={{ position: 'relative' }}>
            <GradSwatch g={sel} grain={gr} blur={blur} tune={tune} dither={dither.on} motion={motion} className="big" style={{ aspectRatio: `${RW} / ${RH}`, height: 'auto', maxHeight: 360 }} />
            {moving && <span className="motion-pill"><i />{motion.kind}</span>}
          </div>
          {rec && rec.name === sel.name && <div className="rec-bar" aria-label="Recording"><i style={{ width: `${Math.round(rec.p * 100)}%` }} /></div>}
          <div className="palette lg">{sel.colors.map(c => <Tooltip key={c} label="Copy hex"><button style={{ background: c }} onClick={async e => { const el = e.currentTarget; await copyText(c); pop(el, 14); toast(<>Copied <b>{c}</b></>) }} /></Tooltip>)}</div>
          <div className="code"><div className="code-tabs">{(['CSS', 'Tailwind'] as const).map(t => <button key={t} className={code === t ? 'on' : ''} onClick={() => setCode(t)}>{t}</button>)}<Tooltip label={`Copy ${code}`}><button className="code-copy" onClick={e => (code === 'CSS' ? copyCss : copyTw)(sel, e.currentTarget)}><Icon name="copy" size={14} /></button></Tooltip></div>
            <pre>{code === 'CSS' ? (moving ? motionSnippet(sel.css, motion, fillFilter) : `background: ${sel.css.replace(/\), /g, '),\n  ')};${fillFilter ? `\nfilter: ${fillFilter};` : ''}`) + (dither.on ? `\n\n/* + dither filter (copied with the CSS) */` : '') : tailwindOf(sel.css)}</pre></div>
          <div className="im-foot"><span className="mono dim">PNG · {RW}×{RH}{dither.on ? ' · dither' : on && sel.tone === 'Grain' ? ' · with grain' : ''}{tune ? ' · adjusted' : ''}</span><div className="row">
            <Key onClick={e => copyCss(sel, e.currentTarget)}><Icon name="copy" size={15} /> Copy gradient</Key>
            {moving && <Key onClick={e => dlVideo(sel, e.currentTarget)} disabled={!!rec}><Icon name="play" size={15} /> {rec ? `Recording ${Math.round(rec.p * 100)}%` : 'Download video'}</Key>}
            <Key variant="primary" onClick={e => dlPng(sel, e.currentTarget)}><Icon name="download" size={15} /> Download PNG</Key>
          </div></div>
        </div>}
      </Modal>
      <FloatDock>
        <DockPop id="grain" label="Grain" value={dither.on ? 'Off · dither' : gr.on ? `${gr.amt}%` : 'Off'} icon={<Icon name="sparkle" size={15} color="#fff" />}>
          <DkRow label="Grain"><DkSwitch on={gr.on} onChange={v => setGr(x => ({ ...x, on: v }))} /></DkRow>
          <DkRow label="Intensity"><DkSlider value={gr.amt} min={0} max={80} onChange={v => setGr(x => ({ ...x, amt: v, on: true }))} unit="%" /></DkRow>
          <DkRow label="Size"><DkChips options={['Fine', 'Medium', 'Coarse'] as const} value={gr.size} onChange={v => setGr(x => ({ ...x, size: v, on: true }))} /></DkRow>
          <p className="dk-note">{dither.on ? 'Grain rests while Dither is on — both are a texture.' : 'Fine film grain on the Grain gradients. Soft gradients stay clean.'}</p>
        </DockPop>
        <DockDiv />
        <DockPop id="blur" label="Blur" value={`${blur}px`} icon={<Icon name="droplet" size={15} color="#fff" />}>
          <DkRow label="Blur"><DkSlider value={blur} min={0} max={40} onChange={setBlur} unit="px" /></DkRow>
          <DkRow label="Presets"><DkChips options={BLUR_PRESETS} value={blur} onChange={setBlur} render={v => <>{v}{v === BLUR_DEFAULT && <i className="dk-def" />}</>} /></DkRow>
          <p className="dk-note">16 px is the default: soft light that keeps every colour of the palette.</p>
          {blur !== BLUR_DEFAULT && <button className="dk-reset" onClick={() => setBlur(BLUR_DEFAULT)}>Reset to 16</button>}
        </DockPop>
        <DockDiv />
        <DockPop id="dither" label="Dither" value={dither.on ? `Bayer ${dither.style}` : 'Off'} icon={<Icon name="grid" size={15} color="#fff" />} width={300}>
          <DkHead icon={<Icon name="grid" size={16} color="#fff" />} title="Dither" onReset={() => setDither(d => ({ ...DITHER_DEFAULT, on: d.on }))} />
          <DkRow label="Dither"><DkSwitch on={dither.on} onChange={v => setDither(d => ({ ...d, on: v }))} /></DkRow>
          <DkRow label="Style"><DkSelect value={dither.style} options={DITHER_STYLES} onChange={v => dz({ style: v })} render={v => `Bayer ${v}×${v}`} /></DkRow>
          <DkRow label="Size"><DkSlider value={dither.size} min={1} max={8} onChange={v => dz({ size: v })} /></DkRow>
          <DkRow label="Levels"><DkSlider value={dither.levels} min={2} max={8} onChange={v => dz({ levels: v })} /></DkRow>
          <DkRow label="Brightness"><DkSlider value={dither.brightness} min={0} max={200} step={5} onChange={v => dz({ brightness: v })} unit="%" /></DkRow>
          <DkRow label="Contrast"><DkSlider value={dither.contrast} min={0} max={3} step={.1} onChange={v => dz({ contrast: +v.toFixed(1) })} /></DkRow>
          <DkRow label="Mono"><DkSwitch on={dither.mono} onChange={v => dz({ mono: v })} /></DkRow>
          <div className={`dk-row ${dither.mono ? '' : 'is-off'}`}><span className="dk-label">Mono color</span><DkColorField color={dither.monoColor} opacity={dither.monoOpacity} onColor={c => dz({ monoColor: c })} onOpacity={v => dz({ monoOpacity: v })} /></div>
          <p className="dk-note">Ordered Bayer dithering over the blurred gradient. PNG and video exports use the same pattern.</p>
        </DockPop>
        <DockDiv />
        <DockPop id="motion" label="Motion" value={moving ? motion.kind : 'Off'} icon={<Icon name="play" size={15} color="#fff" />} width={296}>
          <DkRow label="Motion"><DkChips options={GRAD_MOTIONS} value={motion.kind} onChange={v => setMotion(m => ({ ...m, kind: v }))} render={v => v === 'None' ? 'Off' : v} /></DkRow>
          <DkRow label="Speed"><DkChips options={GRAD_SPEEDS.map(s => s[1])} value={motion.dur} onChange={v => setMotion(m => ({ ...m, dur: v }))} render={v => `${GRAD_SPEEDS.find(s => s[1] === v)![0]} · ${v}s`} /></DkRow>
          <p className="dk-note">{moving ? `${GRAD_MOTION_NOTE[motion.kind]}. Copy gives animated CSS; open a gradient to download a seamless video loop.` : 'Pick a motion to bring every gradient to life.'}</p>
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
