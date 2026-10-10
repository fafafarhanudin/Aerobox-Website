// Writes src/components/aero-icons.tsx for the main site: every icon the site imports, drawn from the
// Aero icon set in library/src/data/icons.ts (the same lines the library ships). Run from the repo root:
//   node library/scripts/build-aero-icons.mjs
import fs from 'fs'
import path from 'path'
const root = path.resolve(new URL('.', import.meta.url).pathname, '../..')
const src = fs.readFileSync(path.join(root, 'library/src/data/icons.ts'), 'utf8')
const head = 'export const ICONS: Icon[] = '
const a = src.indexOf(head) + head.length
const ICONS = JSON.parse(src.slice(a, src.indexOf('\n', a)).trim().replace(/;$/, ''))
const byName = new Map(ICONS.map(i => [i.name, i]))
// every name imported from the aero-icons module anywhere in src/
const files = []
const walk = d => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.(tsx?|jsx?)$/.test(f.name)) files.push(p) } }
walk(path.join(root, 'src'))
const names = new Set()
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8')
  for (const m of t.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'](?:@\/components\/aero-icons|@untitled-ui\/icons-react)["']/g))
    m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean).forEach(n => names.add(n))
}
const kebab = n => n.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/^([A-Z])([A-Z])/, '$1-$2').replace(/([A-Za-z])(\d)/g, '$1-$2').toLowerCase()
const missing = [], out = []
for (const n of [...names].sort()) {
  const ic = byName.get(kebab(n))
  if (!ic) { missing.push(`${n} (${kebab(n)})`); continue }
  out.push(`export const ${n} = aero(${JSON.stringify(ic.body)}, "${n}");`)
}
if (missing.length) { console.error('missing:', missing.join(', ')); process.exit(1) }
const file = `// Aero Icons used by the site, generated from the Aerobox icon set (library/src/data/icons.ts)
// by library/scripts/build-aero-icons.mjs. Re-run it after adding an icon import.
import type { SVGProps } from "react";

type AeroIcon = ((props: SVGProps<SVGSVGElement>) => React.JSX.Element) & { displayName?: string };
function aero(body: string, name: string): AeroIcon {
  const Icon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
  Icon.displayName = name;
  return Icon;
}

${out.join('\n')}
`
fs.writeFileSync(path.join(root, 'src/components/aero-icons.tsx'), file)
console.log('aero-icons:', out.length, 'icons')
