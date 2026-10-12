// Static first screen (nav + hero), rendered at build time by scripts/prerender.mjs into index.html,
// so the heading paints with the CSS instead of waiting for the bundle.
import { renderToString } from 'react-dom/server'
import { Nav, type Modals } from './App'
import { Hero } from './pages/Home'
import { RequestProvider } from './request'

const idle: Modals = { share() {}, support() {}, palette() {} }
export const shell = () => renderToString(
  <RequestProvider><div className="shell"><Nav route="home" modals={idle} /><main><Hero /></main></div></RequestProvider>,
)
