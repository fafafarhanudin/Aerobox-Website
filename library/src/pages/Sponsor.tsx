import { useState } from 'react'
import { Icon, Key, Legend, Tooltip, useToast } from '../ui'
import { party, pop } from '../lib/confetti'

const PLACEMENTS: [string, string, string][] = [
  ['dock', 'Customize dock', 'A quiet line in the floating dock every icon visitor sees.'],
  ['grid', 'Featured tile', 'One sponsored tile at the top of Icons, Gradients or Logos.'],
  ['footer', 'Footer & share card', 'Your logo next to “Aerobox Assets is free” and in the share card.'],
]
const BUDGETS = ['Not sure yet', 'Under $500', '$500 – $2k', '$2k+']
const WEBHOOK = import.meta.env.VITE_SHEETS_WEBHOOK as string | undefined

export default function SponsorPage() {
  const toast = useToast()
  const [f, setF] = useState({ name: '', company: '', email: '', budget: 'Not sure yet', message: '' })
  const [placement, setPlacement] = useState<string[]>(['grid'])
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [touched, setTouched] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(s => ({ ...s, [k]: e.target.value }))
  const emailOk = /^\S+@\S+\.\S+$/.test(f.email)
  const valid = f.name.trim() && emailOk && f.message.trim().length >= 10
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setTouched(true)
    if (!valid) { toast('Please fill in name, a valid email and a short message'); return }
    setState('sending')
    const payload = { form: 'sponsor', ...f, placement: placement.map(p => PLACEMENTS.find(x => x[0] === p)![1]) }
    let ok = false
    try { const r = await fetch('/api/sponsor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); ok = r.ok } catch { /* static hosting */ }
    if (!ok && WEBHOOK) { try { await fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }); ok = true } catch { /* ignore */ } }
    if (!ok) { setState('idle'); toast('Could not send — please try again'); return }
    setState('done'); setTimeout(party, 120)
  }
  return (
    <div className="page sponsor-page">
      <div className="sp-grid">
        <div className="sp-copy">
          <span className="ph-chip"><Icon name="star" size={13} />Sponsorship</span>
          <h1>Become a sponsor</h1>
          <p className="lead">Put your product in front of the designers and developers browsing Aerobox Assets. Tell us a little about it and we will reply with placement options, availability and pricing.</p>
          <div className="sp-facts">
            <div><b className="mono">1,000+</b><span>free assets</span></div>
            <div><b className="mono">4</b><span>libraries</span></div>
            <div><b className="mono">0</b><span>ads or pop-ups</span></div>
          </div>
          <div className="sp-places">
            <span className="side-label mono">Placement options</span>
            {PLACEMENTS.map(([k, t, d]) => (
              <button key={k} type="button" className={`sp-place ${placement.includes(k) ? 'on' : ''}`} onClick={() => setPlacement(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k])}>
                <span className="sp-check">{placement.includes(k) && <svg width="12" height="12" viewBox="0 0 14 14"><path d="M3 7.2 5.8 10 11 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
                <span><b>{t}</b><span>{d}</span></span>
              </button>))}
          </div>
          <p className="sp-note mono">One sponsor per placement at a time · clearly labelled · no tracking scripts</p>
        </div>

        <div className="sp-card">
          {state !== 'done' ? (
            <form onSubmit={submit} noValidate>
              <div className="sp-row">
                <label className={`field ${touched && !f.name.trim() ? 'err' : ''}`}><span>Name</span><input value={f.name} onChange={set('name')} placeholder="Your name" autoComplete="name" /></label>
                <label className="field"><span>Company <i>optional</i></span><input value={f.company} onChange={set('company')} placeholder="Company or product" autoComplete="organization" /></label>
              </div>
              <label className={`field ${touched && !emailOk ? 'err' : ''}`}><span>Email</span><input type="email" value={f.email} onChange={set('email')} placeholder="you@company.com" autoComplete="email" /></label>
              <div className="field"><span>Budget</span><div className="chips">{BUDGETS.map(b => <button type="button" key={b} className={`chip ${f.budget === b ? 'on' : ''}`} onClick={() => setF(s => ({ ...s, budget: b }))}>{b}</button>)}</div></div>
              <label className={`field ${touched && f.message.trim().length < 10 ? 'err' : ''}`}><span>Message</span><textarea rows={5} value={f.message} onChange={set('message')} placeholder="What are you building, who is it for, and when would you like to start?" /></label>
              <div className="sp-submit">
                <span className="mono dim">We reply within one or two working days.</span>
                <Key variant="accent" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : <>Send <Legend>↵</Legend></>}</Key>
              </div>
            </form>
          ) : (
            <div className="thanks">
              <div className="big-heart"><Icon name="send" size={34} color="#2F6BFF" stroke={1.8} /></div>
              <h3>Thanks, {f.name.split(' ')[0]}!</h3>
              <p>Your note is in. We reply within one or two working days at <b>{f.email}</b>.</p>
              <div className="m-actions center">
                <Key onClick={() => { setState('idle'); setF({ name: '', company: '', email: '', budget: 'Not sure yet', message: '' }); setTouched(false) }}>Send another</Key>
                <Tooltip label="Back to the library"><Key variant="primary" href="#/icons" onClick={e => pop(e.currentTarget, 20)}>Browse icons</Key></Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
