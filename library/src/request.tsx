import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { CloseButton, Icon, Key, Legend, Modal, useToast } from './ui'
import { party, pop } from './lib/confetti'

/* One request form for every library page. Rows land in data/requests.csv (Excel) via the dev server,
   and in the Google Sheet when SHEETS_WEBHOOK_URL / VITE_SHEETS_WEBHOOK is configured. */
export type Kind = 'icon' | 'gradient' | 'logo' | 'isometric'
export const KINDS: [Kind, string, string, string][] = [
  ['icon', 'Icon', 'Request an icon', 'layers'], ['gradient', 'Gradient', 'Request a gradient', 'palette'],
  ['logo', 'Logo', 'Request a logo', 'star'], ['isometric', 'Isometric', 'Request an isometric', 'package'],
]
const HINT: Record<Kind, string> = {
  icon: 'e.g. “A calendar-sync icon for a booking app”',
  gradient: 'e.g. “Dark navy to teal mesh for a fintech hero”',
  logo: 'e.g. “Linear and Raycast logos, light and dark”',
  isometric: 'e.g. “A crypto wallet scene with coins and a phone”',
}
const WEBHOOK = import.meta.env.VITE_SHEETS_WEBHOOK as string | undefined
const Ctx = createContext<(k: Kind) => void>(() => {})
export const useRequest = () => useContext(Ctx)
export const requestLabel = (k: Kind) => KINDS.find(x => x[0] === k)![2]

export function RequestProvider({ children }: { children: ReactNode }) {
  const [kind, setKind] = useState<Kind | null>(null)
  return <Ctx.Provider value={setKind}>{children}<RequestModal kind={kind} onClose={() => setKind(null)} /></Ctx.Provider>
}

/* the keycap that sits to the right of each page title */
export function RequestKey({ kind, legend }: { kind: Kind; legend: string }) {
  const open = useRequest()
  return <Key onClick={e => { pop(e.currentTarget, 18); open(kind) }}><Icon name="plus" size={15} /> {requestLabel(kind)} <Legend>{legend}</Legend></Key>
}

function RequestModal({ kind: k0, onClose }: { kind: Kind | null; onClose: () => void }) {
  const toast = useToast()
  const [kind, setKind] = useState<Kind>('icon')
  const [f, setF] = useState({ name: '', email: '', request: '', suggestion: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle'); const [touched, setTouched] = useState(false)
  useEffect(() => { if (k0) { setKind(k0); setState('idle'); setTouched(false) } }, [k0])
  const set = (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(s => ({ ...s, [key]: e.target.value }))
  const emailOk = /^\S+@\S+\.\S+$/.test(f.email)
  const valid = f.name.trim() && emailOk && f.request.trim().length >= 4
  const [hp, setHp] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setTouched(true)
    if (!valid) { toast('Please add your name, a valid email and what you need'); return }
    setState('sending')
    const payload = { form: 'request', kind: KINDS.find(x => x[0] === kind)![1], ...f, page: location.hash || '#/', website: hp }
    let ok = false
    try { const r = await fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); ok = r.ok } catch { /* static hosting */ }
    if (!ok && WEBHOOK) { try { await fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }); ok = true } catch { /* ignore */ } }
    if (!ok) { setState('idle'); toast('Could not send — please try again'); return }
    setState('done'); setF(s => ({ ...s, request: '', suggestion: '' })); setTimeout(party, 120)
  }
  const label = KINDS.find(x => x[0] === kind)!
  return (
    <Modal open={!!k0} onClose={onClose} label={label[2]} width={520}>
      <div className="share-step req" key={state === 'done' ? 'done' : 'form'}>
        {state !== 'done' ? (
          <form onSubmit={submit} noValidate>
            {/* honeypot: hidden from people, filled by bots; the server drops any post that has it */}
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={e => setHp(e.target.value)} />
            <div className="m-head">
              <span className="x-badge req-badge"><Icon name={label[3]} size={17} color="#fff" /></span>
              <div className="m-title"><b>{label[2]}</b><span>Tell us what you need. Popular requests ship first.</span></div>
              <CloseButton onClick={onClose} />
            </div>
            <div className="field"><span>Type</span><div className="chips">{KINDS.map(([kk, name]) => <button type="button" key={kk} className={`chip ${kind === kk ? 'on' : ''}`} onClick={() => setKind(kk)}>{name}</button>)}</div></div>
            <div className="sp-row">
              <label className={`field ${touched && !f.name.trim() ? 'err' : ''}`}><span>Name</span><input value={f.name} onChange={set('name')} placeholder="Your name" autoComplete="name" /></label>
              <label className={`field ${touched && !emailOk ? 'err' : ''}`}><span>Email</span><input type="email" value={f.email} onChange={set('email')} placeholder="you@email.com" autoComplete="email" /></label>
            </div>
            <label className={`field ${touched && f.request.trim().length < 4 ? 'err' : ''}`}><span>Request</span><textarea rows={3} value={f.request} onChange={set('request')} placeholder={HINT[kind]} /></label>
            <label className="field"><span>Suggestions <i>optional</i></span><textarea rows={2} value={f.suggestion} onChange={set('suggestion')} placeholder="Anything we could do better?" /></label>
            <div className="sp-submit">
              <span className="mono dim">Saved to our request sheet · no spam</span>
              <Key variant="accent" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : <>Send request <Legend>↵</Legend></>}</Key>
            </div>
          </form>
        ) : (
          <div className="thanks">
            <div className="big-heart"><Icon name="send" size={34} color="#2F6BFF" stroke={1.8} /></div>
            <h3>Request received!</h3>
            <p>Thanks, {f.name.split(' ')[0]}. We will let you know at <b>{f.email}</b> when it ships.</p>
            <div className="m-actions center">
              <Key onClick={() => setState('idle')}>Send another</Key>
              <Key variant="primary" onClick={e => { pop(e.currentTarget, 20); onClose() }}>Done</Key>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
