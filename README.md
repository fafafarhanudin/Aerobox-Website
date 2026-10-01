# Aerobox — portfolio website

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4, built from the Aerobox Figma file
(landing, `/work` and the "Aerobox DS — Handoff & Motion" board).

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where things live

- `src/data/projects.ts` — all 100 works and the 55 in the "Selected work" loop. Counts on the site are computed from this list.
- `src/lib/site.ts` — contact links, availability text, social profiles.
- `src/components/sections/*` — one file per landing section.
- `src/app/globals.css` — design tokens and the keycap / marquee styles.
- `public/work/*.webp` — project screenshots exported from Figma.

## Deploy (GitHub → Vercel)

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** this repository. The defaults are correct (framework: Next.js).
3. Optional environment variables: `NEXT_PUBLIC_TELEGRAM`, `NEXT_PUBLIC_UPWORK`, `NEXT_PUBLIC_SITE_URL`.
4. Every push to `main` deploys to production; every pull request gets a preview URL.
5. Add a custom domain in Vercel → Project → Settings → Domains.
