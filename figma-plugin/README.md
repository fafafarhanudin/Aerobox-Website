# Aerobox Assets for Figma

Browse the Aerobox Assets library (icons, isometric illustrations, gradients, brand logos, logo templates, avatars and
flags) and add them to the canvas. Data comes from the public API at `https://www.aeroboxstudio.com/api/assets`.

- Icons: round or sharp, stroke 1 / 1.5 / 2, any colour, 16-48 px.
- Isometric: every palette from the library or two custom colours; the hard shadow is a native drop shadow.
- Gradients: converted from CSS to native Figma fills (linear, radial and conic layers). Select layers to apply.
- Brands: light, dark and wordmark versions.

## Try it

Figma desktop → Plugins → Development → Import plugin from manifest → `manifest.json`.

For local work against `npm run dev` / `next start` on port 3211, change `BASE` at the top of the script in `ui.html`.

## Ship it

`npm run figma:zip` writes `public/downloads/aerobox-assets-figma.zip`, linked from /integrations.
To publish in the Figma Community, create the plugin in Figma (Plugins → Development → New plugin) to get a real id,
put that id in `manifest.json`, then publish from Figma.
