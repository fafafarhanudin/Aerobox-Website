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
// The app script starts after the static hero has painted: two frames later, or after 300ms where frames do not
// run (a background tab, some crawlers). Lighthouse then measures first paint as HTML + CSS, which is what the user sees.
const entry = page.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
if (!entry) throw new Error('dist/index.html: module entry script not found')
const boot = `<script>(function(){var d=0;function go(){if(d)return;d=1;var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src='${entry[1]}';document.head.appendChild(s)}requestAnimationFrame(function(){requestAnimationFrame(go)});setTimeout(go,300)})()</script>`
const out = page
  .replace(entry[0], '')
  .replace(/<link rel="modulepreload"[^>]*>\s*/g, '')
  .replace('<div id="root"></div>', `<div id="root">${html}</div>${drop}${boot}`)
writeFileSync(file, out)
console.log(`prerendered shell: ${(html.length / 1024).toFixed(1)} KB`)
