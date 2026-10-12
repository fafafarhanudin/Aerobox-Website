// When index.html already carries the pre-rendered nav + hero (scripts/prerender.mjs), the first React
// render skips the entrance animations, so swapping the static markup for the live one does not flash.
// During pre-rendering itself (no document) it is true as well, so the static markup is drawn at rest.
let still = typeof document === 'undefined' || !!document.getElementById('root')?.firstElementChild
export const isPrerendered = () => still
export const settle = () => { still = false }
