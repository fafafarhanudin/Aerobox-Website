import { useMemo, useState } from 'react'
import { CloseButton, Modal, Tooltip, copyText, download, useToast, Icon, Key, Legend } from '../ui'
import { DkChips, DkRow, DkSlider, DockColor, DockDiv, mixHex, DockPop, DockStep, FloatDock, Formats, PageHead, PillTabs, Select, Summary, ViewToggle } from '../pagekit'
import { ISO } from '../data/iso'
import { pop } from '../lib/confetti'
import { RequestKey, useRequest } from '../request'

const CATS = ['All', 'SaaS', 'Finance', 'Technology', 'Web3', 'Marketing', 'Devices', 'Objects', 'Buildings', 'Furniture', 'Charts', 'Nature', 'UI']
type T = typeof ISO[number]
type Pal = 'Blue' | 'Green' | 'Violet' | 'Mono' | 'Custom'
// the templates are drawn in the blue palette; other palettes are a 1:1 swap of the same six tones
const BLUE = ['#E3EAFF', '#B8C8F8', '#4D7CFE', '#98B3FE', '#3C61C6', '#1F2A5A']
const PALS: Record<Exclude<Pal, 'Custom'>, string[]> = {
  Blue: BLUE,
  Green: ['#DCFCE7', '#A7F3D0', '#22C55E', '#86EFAC', '#15803D', '#14532D'],
  Violet: ['#EDE9FE', '#C4B5FD', '#7C3AED', '#A78BFA', '#5B21B6', '#2E1065'],
  Mono: ['#EEEFF2', '#C9CBD2', '#3A3B42', '#8D909A', '#16171B', '#16171B'],
}
const DOT: Record<Exclude<Pal, 'Custom'>, string> = { Blue: '#4D7CFE', Green: '#22C55E', Violet: '#7C3AED', Mono: '#16171B' }
type Line = '1px' | '1.5px' | '2px'
// a custom colour becomes the same six-tone ramp: tints for faces in light, shades for faces in shadow
const customTones = (c: string) => [mixHex(c, '#FFFFFF', .86), mixHex(c, '#FFFFFF', .6), c, mixHex(c, '#FFFFFF', .36), mixHex(c, '#000000', .28), mixHex(c, '#000000', .66)]
const recolor = (svg: string, tones: string[], line: Line) => {
  let s = svg
  if (tones !== BLUE) BLUE.forEach((c, i) => { s = s.split(c).join(tones[i]).split(c.toLowerCase()).join(tones[i]) })
  if (line !== '1px') s = s.replace(/stroke-width="1"/g, `stroke-width="${parseFloat(line)}"`)
  return s
}
type Shadow = 'None' | 'Soft' | 'Long'
type ShadowCfg = { angle: number; dist: number; blur: number; op: number }
type Scene = { bg: 'Plain' | 'Grid' | 'Glow'; shadow: Shadow; sh: ShadowCfg }
// presets; the default direction drops down and behind the object (down-right, away from the top-left light)
const SH_PRESET: Record<Exclude<Shadow, 'None'>, ShadowCfg> = { Soft: { angle: 50, dist: 10, blur: 6, op: 22 }, Long: { angle: 50, dist: 26, blur: 3, op: 16 } }
const NO_SHADOW: Scene = { bg: 'Plain', shadow: 'None', sh: SH_PRESET.Soft }
// scene extras are drawn in the base blue tones so every palette swap recolours them too
const sceneOf = (sc: Scene) => (sc.bg === 'Grid' ? '<defs><pattern id="isog" width="20.78" height="12" patternUnits="userSpaceOnUse"><path d="M0 6 L10.39 0 L20.78 6 L10.39 12 Z" fill="none" stroke="#B8C8F8" stroke-width=".5"/></pattern></defs><rect width="240" height="200" fill="#FFFFFF"/><rect width="240" height="200" fill="url(#isog)"/>'
  : sc.bg === 'Glow' ? '<defs><radialGradient id="isoglow" cx=".5" cy=".56" r=".62"><stop offset="0" stop-color="#E3EAFF"/><stop offset="1" stop-color="#FFFFFF"/></radialGradient></defs><rect width="240" height="200" fill="url(#isoglow)"/>' : '')
const artOf = (t: T, sc: Scene) => {
  if (sc.shadow === 'None') return t.svg
  const { angle, dist, blur, op } = sc.sh, a = angle * Math.PI / 180
  const dx = +(Math.cos(a) * dist).toFixed(2), dy = +(Math.sin(a) * dist).toFixed(2), id = `isosh-${angle}-${dist}-${blur}-${op}`
  return `<defs><filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/><feOffset dx="${dx}" dy="${dy}" result="o"/>`
    + `<feFlood flood-color="#1F2A5A" flood-opacity="${op / 100}"/><feComposite in2="o" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#${id})">${t.svg}</g>`
}
const svgOf = (t: T, tones: string[], line: Line, w = 240, h = 200, sc: Scene = NO_SHADOW) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" width="${w}" height="${h}">${recolor(sceneOf(sc) + artOf(t, sc), tones, line)}</svg>`
const ZOOMS = [.8, .9, 1, 1.1, 1.2]
const SORTS = ['Popular', 'A–Z', 'Newest'] as const

export default function IsoPage() {
  const toast = useToast(); const request = useRequest()
  const [cat, setCat] = useState('All'); const [q, setQ] = useState(''); const [sel, setSel] = useState<T | null>(null)
  const [pal, setPal] = useState<Pal>('Blue'); const [line, setLine] = useState<Line>('1px'); const [sort, setSort] = useState<typeof SORTS[number]>('Popular'); const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sc, setSc] = useState<Scene>(NO_SHADOW); const [zoom, setZoom] = useState(1)
  const [cc, setCc] = useState('#F97316')
  const tones = pal === 'Custom' ? customTones(cc) : PALS[pal]; const dotOf = (p: Pal) => p === 'Custom' ? cc : DOT[p]
  const list = useMemo(() => {
    let l = ISO.filter(t => (cat === 'All' || t.cat === cat) && t.name.toLowerCase().includes(q.toLowerCase()))
    if (sort === 'A–Z') l = [...l].sort((a, b) => a.name.localeCompare(b.name)); if (sort === 'Newest') l = [...l].reverse()
    return l
  }, [cat, q, sort])
  const idx = (t: T) => String(ISO.indexOf(t) + 1).padStart(2, '0')
  const copy = async (t: T, el: Element) => { await copyText(svgOf(t, tones, line, 240, 200, sc), t.name); pop(el, 18); toast(<>Copied <b>{t.name}</b> · {pal}</>) }
  const dl = (t: T, el: Element) => { download(`${t.key}.svg`, svgOf(t, tones, line, 240, 200, sc)); pop(el, 20); toast(<>Downloaded <b>{t.name}.svg</b></>) }
  return (
    <div className="page iso-page">
      <PageHead chip="Isometric" count={ISO.length} title="Isometric" desc="Editable isometric templates for SaaS, finance, devices, rooms and objects, all in one 30° projection."
        action={<RequestKey kind="isometric" legend="R" />} />
      <Summary cells={[['Items', `${ISO.length} templates`], ['Formats', <Formats list={['SVG', 'FIG', 'PNG']} />], ['Projection', '30° · 4 palettes + custom'], ['License', 'Free for commercial use']]} />
      <div className="toolbar2">
        <label className="search sm"><Icon name="search" size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search templates..." /></label>
        <Select label="Sort" value={sort} options={[...SORTS]} onChange={setSort} />
        <ViewToggle value={view} onChange={setView} />
      </div>
      <PillTabs items={CATS.map(c => [c, c === 'All' ? ISO.length : ISO.filter(t => t.cat === c).length])} value={cat} onChange={setCat} right={`Showing ${list.length} templates`} />

      {view === 'grid' ? (
        <div className="iso-grid">
          {list.map((t, k) => (
            <article key={t.key} className="iso-card" style={{ ['--i' as string]: Math.min(k, 16) }} onClick={() => setSel(t)}>
              <div className={`ic-preview scene-${sc.bg.toLowerCase()}`} style={{ ["--sg" as string]: tones[1] + "99", ["--sl" as string]: tones[0] }}><div className="ic-art" style={{ ["--z" as string]: zoom }} dangerouslySetInnerHTML={{ __html: svgOf(t, tones, line, 240, 200, { ...sc, bg: "Plain" }) }} />
                <div className="gc-actions" onClick={e => e.stopPropagation()}>
                  <Tooltip label="Open"><button className="gc-round" onClick={() => setSel(t)}><Icon name="expand" size={14} /></button></Tooltip>
                </div>
                <div className="gc-bar" onClick={e => e.stopPropagation()}>
                  <button onClick={e => copy(t, e.currentTarget)}><Icon name="copy" size={14} /> Copy SVG</button>
                  <button onClick={e => dl(t, e.currentTarget)}><Icon name="download" size={14} /> Download SVG</button>
                </div>
              </div>
              <div className="ic-cap">
                <div className="ic-title"><div><b>{t.name}</b><span className="dim">{t.cat}</span></div><span className="mono dim">{idx(t)}</span></div>
                <div className="ic-meta" onClick={e => e.stopPropagation()}><Formats list={['SVG', 'FIG', 'PNG']} />
                  <span className="pal-dots">{(Object.keys(DOT) as Pal[]).map(p => <Tooltip key={p} label={p}><button className={p === pal ? 'on' : ''} style={{ background: dotOf(p) }} onClick={() => setPal(p)} aria-label={p} /></Tooltip>)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="iso-list">
          {list.map((t, k) => (
            <div key={t.key} className="il-row" style={{ ['--i' as string]: Math.min(k, 16) }} onClick={() => setSel(t)}>
              <span className="mono dim">{idx(t)}</span>
              <span className="il-thumb" dangerouslySetInnerHTML={{ __html: svgOf(t, tones, line, 96, 80) }} />
              <b>{t.name}</b><span className="dim">{t.cat}</span><Formats list={['SVG', 'FIG', 'PNG']} />
              <span className="il-actions" onClick={e => e.stopPropagation()}>
                <Key size="sm" onClick={e => copy(t, e.currentTarget)}><Icon name="copy" size={14} /> Copy</Key>
                <Key size="sm" onClick={e => dl(t, e.currentTarget)}><Icon name="download" size={14} /> Download</Key>
              </span>
            </div>
          ))}
        </div>
      )}
      {list.length === 0 && <div className="empty"><Icon name="search" size={28} /><b>No templates match “{q}”</b></div>}
      <div className="request-row"><span>Need another template?</span><Key onClick={e => { pop(e.currentTarget, 24); request('isometric') }}>Request a template <Legend>R</Legend></Key></div>

      <Modal open={!!sel} onClose={() => setSel(null)} label="Template" width={620}>
        {sel && <div className="iso-modal">
          <div className="im-head"><b>{sel.name}</b><span className="badge-n">{sel.cat}</span><span className="badge-n">{pal} · {line}</span><CloseButton onClick={() => setSel(null)} /></div>
          <div className="iso-big" key={sel.key + pal + line} dangerouslySetInnerHTML={{ __html: svgOf(sel, tones, line, 480, 400, sc) }} />
          <div className="pal-switch">{([...Object.keys(DOT), 'Custom'] as Pal[]).map(p => <button key={p} className={p === pal ? 'on' : ''} onClick={() => setPal(p)}><i style={{ background: dotOf(p) }} />{p}</button>)}</div>
          <div className="im-foot"><span className="mono dim">Editable faces · one light source</span><div className="row">
            <Key onClick={e => copy(sel, e.currentTarget)}><Icon name="copy" size={15} /> Copy SVG</Key>
            <Key variant="primary" onClick={e => dl(sel, e.currentTarget)}><Icon name="download" size={15} /> Download SVG</Key>
          </div></div>
        </div>}
      </Modal>
      <FloatDock>
        <div className="dock-sw compact">{(Object.keys(DOT) as Pal[]).map(p => <Tooltip key={p} label={p}><button className={p === pal ? 'on' : ''} style={{ background: dotOf(p) }} onClick={() => setPal(p)} aria-label={p} /></Tooltip>)}
          <DockColor on={pal === 'Custom'} value={cc} onChange={c => { setCc(c); setPal('Custom') }} /></div>
        <DockDiv />
        <DockPop id="line" label="Line" value={line} icon={<Icon name="pen-line" size={15} color="#fff" />} width={240}>
          <DkRow label="Outline"><DkChips options={['1px', '1.5px', '2px'] as Line[]} value={line} onChange={setLine} /></DkRow>
        </DockPop>
        <DockDiv />
        <DockPop id="proj" label="Projection" value="30°" icon={<Icon name="layers" size={15} color="#fff" />} width={250}>
          <DkRow label="Angle"><DkChips options={['30°', '2:1', 'Top']} value="30°" onChange={() => {}} locked={['2:1', 'Top']} /></DkRow>
          <p className="dk-note">2:1 pixel-art and top-down views: coming soon.</p>
        </DockPop>
        <DockDiv />
        <DockPop id="scene" label="Scene" value={sc.shadow === 'None' ? sc.bg : `${sc.bg} · ${sc.shadow}`} icon={<Icon name="image" size={15} color="#fff" />} width={300}>
          <DkRow label="Background"><DkChips options={['Plain', 'Grid', 'Glow'] as Scene['bg'][]} value={sc.bg} onChange={v => setSc(x => ({ ...x, bg: v }))} /></DkRow>
          <DkRow label="Shadow"><DkChips options={['None', 'Soft', 'Long'] as Shadow[]} value={sc.shadow} onChange={v => setSc(x => ({ ...x, shadow: v, sh: v === 'None' ? x.sh : SH_PRESET[v] }))} /></DkRow>
          {sc.shadow !== 'None' && <>
            <DkRow label="Direction"><DkSlider value={sc.sh.angle} min={0} max={355} step={5} unit="°" onChange={v => setSc(x => ({ ...x, sh: { ...x.sh, angle: v } }))} /></DkRow>
            <DkRow label="Distance"><DkSlider value={sc.sh.dist} min={0} max={40} onChange={v => setSc(x => ({ ...x, sh: { ...x.sh, dist: v } }))} /></DkRow>
            <DkRow label="Blur"><DkSlider value={sc.sh.blur} min={0} max={14} onChange={v => setSc(x => ({ ...x, sh: { ...x.sh, blur: v } }))} /></DkRow>
            <DkRow label="Opacity"><DkSlider value={sc.sh.op} min={4} max={60} unit="%" onChange={v => setSc(x => ({ ...x, sh: { ...x.sh, op: v } }))} /></DkRow>
          </>}
          <p className="dk-note">Scene settings are included when you copy or download the SVG.</p>
        </DockPop>
        <DockDiv />
        <DockStep label="Size" value={`${Math.round(zoom * 100)}%`} onMinus={() => setZoom(v => ZOOMS[Math.max(0, ZOOMS.indexOf(v) - 1)])} onPlus={() => setZoom(v => ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(v) + 1)])} />
      </FloatDock>
    </div>
  )
}
