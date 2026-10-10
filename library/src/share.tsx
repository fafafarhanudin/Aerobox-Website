import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { BrandMark, CloseButton, Icon, Modal, Tooltip, XLogo, copyText, useToast, Key, Legend } from './ui'
import { party, pop } from './lib/confetti'

export const SITE = 'https://www.aeroboxstudio.com/library'
/** pre-filled posts — the first one is the default, "Another line" cycles through the rest */
export const SHARE_LINES = [
  'Bookmark this: Aerobox Assets has 1,000+ free icons, gradients, isometric scenes and logo marks. Copy as SVG, CSS or PNG and ship. No sign-up, no paywall.',
  'Stop paying for icon packs. Aerobox Assets gives you 1,000+ free icons, gradients and templates you can tweak and drop straight into Figma or code.',
  'New favourite design bookmark: Aerobox Assets. Icons with adjustable stroke, smooth gradients, isometric scenes and logo marks. Over 1,000 of them, all free.',
  'Designers and devs: Aerobox Assets is a free library of 1,000+ icons, gradients and templates. Pick a style, adjust the stroke or gradient, copy, done.',
]
const BASE_TEXT = SHARE_LINES[0]
const TAGS = ['#design', '#icons', '#figma']

/* ---------- OG / link-preview card (1200×630, scaled to fit) ---------- */
export function OGCard({ width = 512 }: { width?: number }) {
  const s = width / 1200
  return (
    <div className="og-wrap" style={{ width, height: Math.round(630 * s) }}>
      <div className="og" style={{ transform: `scale(${s})` }}>
        <div className="og-copy">
          <div className="og-brand"><BrandMark size={44} /><b>Aerobox Assets</b><span className="og-ver">2.0</span></div>
          <h3>1,000+ <em>free</em> assets,<br />ready to use</h3>
          <p>Icons, gradients, isometric scenes and logo marks.<br />On the web, in Figma and on npm.</p>
          <div className="og-chips"><span className="on">Aero icons</span><span>Gradients</span><span>Isometric</span><span>Logo marks</span></div>
        </div>
        <span className="og-domain">aeroboxstudio.com/library</span>
        <div className="og-panel">
          <div className="og-ph"><span><BrandMark size={18} /> Aerobox Icons</span><span className="x">×</span></div>
          <div className="og-search"><Icon name="search" size={14} /> Search 1,172 icons</div>
          <div className="og-tabs"><span className="on">Aero</span><span>Duotone</span><span>Filled</span><span>Sharp</span></div>
          <div className="og-grid">
            {['heart', 'bell', 'home', 'layers', 'lock', 'search', 'settings', 'star', 'trash', 'chat', 'folder', 'mail', 'camera', 'calendar', 'chart-pie'].map(n =>
              <span key={n} className={n === 'star' ? 'sel' : ''}><Icon name={n} size={20} /></span>)}
          </div>
          <div className="og-ctl">
            <div><label>Size</label>{[16, 20, 24, 32, 48].map(v => <span key={v} className={v === 24 ? 'on' : ''}>{v}</span>)}</div>
            <div><label>Stroke</label><span className="og-slider"><i /></span><b>1.5</b></div>
            <div><label>Color</label><span className="og-sw" /><span className="og-hex">#16171B</span></div>
          </div>
        </div>
        {[['sun', '#2F6BFF', 72], ['magic-wand', '#16171B', 292], ['heart', '#E5484D', 500]].map(([n, c, y]) =>
          <span key={n as string} className="og-float" style={{ top: y as number }}><Icon name={n as string} size={36} color={c as string} /></span>)}
      </div>
    </div>
  )
}

export function intentUrl(text: string) {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE)}`
}

/* ---------- Share modal: compose → thanks (+ confetti) ---------- */
export function ShareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const [step, setStep] = useState<'compose' | 'thanks'>('compose')
  const [text, setText] = useState(BASE_TEXT)
  const [tags, setTags] = useState<string[]>(['#design', '#icons'])
  useEffect(() => { if (open) { setStep('compose') } }, [open])
  const full = `${text} ${tags.join(' ')}`.trim()
  const count = full.length + 1 + 23 // X counts every link as 23 chars
  const post = () => {
    window.open(intentUrl(full), '_blank', 'noopener,width=600,height=640')
    setStep('thanks'); setTimeout(party, 140)
  }
  const copy = async (el: HTMLElement) => { await copyText(SITE); pop(el, 26); toast('Link copied to clipboard') }
  return (
    <Modal open={open} onClose={onClose} label="Share Aerobox Assets on X" width={step === 'compose' ? 560 : 480}>
      <div className={`share-step ${step}`} key={step}>
        {step === 'compose' ? (
          <>
            <div className="m-head">
              <span className="x-badge"><XLogo size={16} color="#fff" /></span>
              <div className="m-title"><b>Share Aerobox Assets on X</b><span>We fill in the post. You just hit Post.</span></div>
              <CloseButton onClick={onClose} />
            </div>
            <OGCard width={512} />
            <div className="post-box">
              <textarea value={text} onChange={e => setText(e.target.value)} rows={3} aria-label="Post text" />
              <div className="post-meta">
                <div className="tags">{TAGS.map(t => <button key={t} className={`tag ${tags.includes(t) ? 'on' : ''}`} onClick={() => setTags(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t])}>{t}</button>)}
                  <button className="tag shuffle" onClick={() => setText(t => SHARE_LINES[(SHARE_LINES.indexOf(t) + 1) % SHARE_LINES.length])}><Icon name="refresh" size={12} /> Another line</button></div>
                <span className={`count ${count > 280 ? 'over' : ''}`}>{count} / 280</span>
              </div>
            </div>
            <div className="m-actions">
              <Key onClick={e => copy(e.currentTarget)}><Icon name="link" size={16} /> Copy link</Key>
              <Tooltip label="Opens a pre-filled post" kbd="⌘ ↵">
                <Key variant="primary" grow onClick={post} disabled={count > 280}><XLogo size={14} color="#fff" /> Post on X <Icon name="arrow-up-right" size={16} /></Key>
              </Tooltip>
            </div>
            <p className="m-note">Opens x.com/intent/post in a new tab · nothing is posted without you</p>
          </>
        ) : (
          <div className="thanks">
            <div className="thanks-art"><OGCard width={256} /><span className="posted"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 7.2 5.8 10 11 4.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>Posted on X</span></div>
            <h3>Thanks for spreading the word!</h3>
            <p>Your post is ready on X. Every share helps keep Aerobox Assets free for everyone.</p>
            <div className="m-actions center">
              <Key onClick={onClose}>Back to library</Key>
              <Key variant="primary" onClick={() => party()}>Celebrate again <Icon name="magic-wand" size={16} /></Key>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

/* ---------- Support modal ---------- */
const WEBHOOK = import.meta.env.VITE_SHEETS_WEBHOOK as string | undefined
const WALLETS = ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'Mobile banking']
export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const [f, setF] = useState({ name: '', message: '' }); const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle'); const [touched, setTouched] = useState(false)
  useEffect(() => { if (open) { setState('idle'); setTouched(false) } }, [open])
  const valid = f.name.trim() && f.message.trim().length >= 3
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setTouched(true)
    if (!valid) { toast('Please add your name and a short message'); return }
    setState('sending'); const payload = { form: 'support', ...f }
    let ok = false
    try { ok = (await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).ok } catch { /* static hosting */ }
    if (!ok && WEBHOOK) { try { await fetch(WEBHOOK, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) }); ok = true } catch { /* ignore */ } }
    if (!ok) { setState('idle'); toast('Could not send, please try again'); return }
    setState('done'); setTimeout(party, 120)
  }
  const saveQr = async () => { const b = await (await fetch('/library/qris-code.png')).blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'aerobox-qris.png'; a.click(); toast('QR code saved') }
  return (
    <Modal open={open} onClose={onClose} label="Support Aerobox Assets" width={760}>
      <div className="sup" key={state === 'done' ? 'done' : 'form'}>
        <div className="sup-qr">
          <div className="sup-qr-card"><img src="/library/qris-code.png" alt="QRIS code for Aerobox Design" width={268} height={268} /></div>
          <div className="sup-wallets">{WALLETS.map(w => <span key={w}>{w}</span>)}</div>
          <button className="sup-save" onClick={saveQr}><Icon name="download" size={14} /> Save QR code</button>
        </div>
        <div className="sup-side">
          {state !== 'done' ? (<>
            <div className="m-head">
              <span className="x-badge heart"><Icon name="heart" size={18} color="#fff" /></span>
              <div className="m-title"><b>Support Aerobox Assets</b><span>Scan the QRIS with any wallet, any amount. Then leave a note.</span></div>
              <CloseButton onClick={onClose} />
            </div>
            <ol className="sup-steps">
              <li><b>1</b>Open your e-wallet or banking app and scan the code.</li>
              <li><b>2</b>Pick any amount you like. Every bit keeps the library free.</li>
              <li><b>3</b>Leave your name and a message so Farhan can say thanks.</li>
            </ol>
            <form className="sup-form" onSubmit={send} noValidate>
              <label className={`field ${touched && !f.name.trim() ? 'err' : ''}`}><span>Name</span><input value={f.name} onChange={e => setF(s => ({ ...s, name: e.target.value }))} placeholder="Your name" autoComplete="name" /></label>
              <label className={`field ${touched && f.message.trim().length < 3 ? 'err' : ''}`}><span>Message</span><textarea rows={3} value={f.message} onChange={e => setF(s => ({ ...s, message: e.target.value }))} placeholder="Say hi, or tell us what you would like to see next" /></label>
              <Key variant="accent" grow type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : <><Icon name="send" size={16} /> Send message <Legend>↵</Legend></>}</Key>
            </form>
          </>) : (
            <div className="thanks">
              <div className="big-heart"><Icon name="heart" size={40} color="#E5484D" stroke={1.8} /></div>
              <h3>Thank you, {f.name.split(' ')[0]}!</h3>
              <p>Your message reached Farhan. Support like yours keeps every icon, gradient and template free.</p>
              <div className="m-actions center"><Key onClick={() => { setState('idle'); setF({ name: '', message: '' }); setTouched(false) }}>Send another</Key><Key variant="primary" onClick={onClose}>Back to library</Key></div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
