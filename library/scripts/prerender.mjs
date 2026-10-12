// Pre-renders src/shell.tsx into dist/index.html after `vite build`.
// Hash routes other than home drop the static hero before first paint, so they never flash it.
import { readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
const { shell } = await vite.ssrLoadModule('/src/shell.tsx')
const html = shell()
await vite.close()

const file = new URL('../dist/index.html', import.meta.url)
const page = readFileSync(file, 'utf8')
if (!page.includes('<div id="root"></div>')) throw new Error('dist/index.html: empty #root not found')
const drop = `<script>(function(){var p=location.hash.replace(/^#\\/?/,'').split('?')[0];if(['icons','gradients','logos','isometric','sponsor'].indexOf(p)>-1)document.getElementById('root').innerHTML=''})()</script>`
writeFileSync(file, page.replace('<div id="root"></div>', `<div id="root">${html}</div>${drop}`))
console.log(`prerendered shell: ${(html.length / 1024).toFixed(1)} KB`)
