import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Form inboxes for the local demo — every submission becomes a row in a CSV file (opens straight in Excel / Numbers)
 * and, when SHEETS_WEBHOOK_URL is set in .env.local, is forwarded to a Google Sheet (tab chosen by `form`).
 *   POST /api/sponsor  → data/sponsors.csv   · GET /api/sponsors.csv
 *   POST /api/request  → data/requests.csv   · GET /api/requests.csv
 */
type Inbox = { post: string; get: string; file: string; head: string[]; need: string[]; row: (d: Record<string, unknown>) => unknown[] }
const INBOXES: Inbox[] = [
  { post: '/api/sponsor', get: '/api/sponsors.csv', file: 'data/sponsors.csv', need: ['name', 'email', 'message'],
    head: ['Submitted at', 'Name', 'Company', 'Email', 'Budget', 'Placement', 'Message'],
    row: d => [d.company, d.email, d.budget, ((d.placement as string[]) ?? []).join(' + '), d.message] },
  { post: '/api/request', get: '/api/requests.csv', file: 'data/requests.csv', need: ['name', 'email', 'request'],
    head: ['Submitted at', 'Name', 'Email', 'Type', 'Request', 'Suggestion', 'Page'],
    row: d => [d.email, d.kind, d.request, d.suggestion, d.page] },
  { post: '/api/support', get: '/api/supporters.csv', file: 'data/supporters.csv', need: ['name', 'message'],
    head: ['Submitted at', 'Name', 'Message'],
    row: d => [d.message] },
]
function formInbox(webhook?: string): Plugin {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const box = INBOXES.find(b => b.get === req.url || b.post === req.url)
    if (!box) return next()
    const file = path.resolve(__dirname, box.file)
    if (req.url === box.get && req.method === 'GET') {
      if (!fs.existsSync(file)) { res.statusCode = 404; return res.end('No submissions yet') }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', `attachment; filename="aerolabs-${path.basename(box.file)}"`)
      return res.end(fs.readFileSync(file))
    }
    if (req.method !== 'POST') return next()
    let body = ''
    for await (const chunk of req) body += chunk
    try {
      const d = JSON.parse(body)
      if (box.need.some(k => !String(d[k] ?? '').trim())) { res.statusCode = 400; return res.end(JSON.stringify({ ok: false, error: 'missing fields' })) }
      fs.mkdirSync(path.dirname(file), { recursive: true })
      if (!fs.existsSync(file)) fs.writeFileSync(file, '\uFEFF' + box.head.map(esc).join(',') + '\n') // BOM so Excel reads UTF-8
      fs.appendFileSync(file, [new Date().toISOString(), d.name, ...box.row(d)].map(esc).join(',') + '\n')
      let sheet = false
      if (webhook) { try { const r = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }); sheet = r.ok } catch { /* offline */ } }
      res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: true, sheet }))
    } catch { res.statusCode = 400; res.end(JSON.stringify({ ok: false })) }
  }
  return { name: 'form-inbox', configureServer(s) { s.middlewares.use(handler) }, configurePreviewServer(s) { s.middlewares.use(handler) } }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { base: '/library/', plugins: [react(), formInbox(env.SHEETS_WEBHOOK_URL)] }
})
