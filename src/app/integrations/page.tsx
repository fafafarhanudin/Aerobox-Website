import { Eyebrow, Key, Legend } from "@/components/ui";
import { counts } from "@/lib/assets";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta(
  "Aerobox Assets for AI and Figma",
  "Connect Aerobox Assets to Claude, Cursor and other MCP clients, or add icons, isometric illustrations, gradients and logos straight from the Figma plugin.",
  "/integrations",
);

const MCP_URL = "https://www.aeroboxstudio.com/mcp";
const total = Object.values(counts).reduce((a, b) => a + b, 0);

function Code({ label, children }: { label: string; children: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="font-mono text-[11px] uppercase leading-4 tracking-[0.08em] text-ink-3">{label}</figcaption>
      <pre className="overflow-x-auto rounded-[14px] border border-line bg-page p-4 font-mono text-[13px] leading-5 text-ink">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-7 shrink-0 place-items-center rounded-[8px] border border-line bg-page font-mono text-[12px] text-ink-2">{n}</span>
      <div className="flex flex-col gap-1 pt-0.5">
        <h3 className="text-[15px] font-medium leading-6 text-ink">{title}</h3>
        <div className="text-[14px] leading-[22px] text-ink-2">{children}</div>
      </div>
    </li>
  );
}

export default function Integrations() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col gap-5 border-b border-line px-5 py-14 md:px-8 md:py-[72px] lg:px-12 lg:py-24">
        <Eyebrow label="Aerobox Assets" count={`${total.toLocaleString("en-US")} assets`} />
        <h1 className="font-heading max-w-[860px] text-[34px] leading-[40px] tracking-[-0.68px] text-ink md:text-[48px] md:leading-[54px] md:tracking-[-0.96px]">
          The library, inside your AI tools <span className="text-ink-soft">and your Figma files.</span>
        </h1>
        <p className="max-w-[640px] text-[16px] leading-[26px] text-ink-2 md:text-[18px] md:leading-7">
          {counts.icon.toLocaleString("en-US")} icons, {counts.isometric} isometric illustrations, {counts.gradient} gradients, {counts.brand.toLocaleString("en-US")} brand logos, logo templates,
          avatars and flags. Free, with no sign-up and no API key.
        </p>
        <div className="flex flex-wrap gap-3">
          <Key href="#mcp" variant="primary" capClassName="h-11 gap-2.5 pl-4 pr-3 text-[15px] font-medium">
            Connect over MCP
            <Legend>M</Legend>
          </Key>
          <Key href="#figma" capClassName="h-11 gap-2.5 pl-4 pr-3 text-[15px] font-medium">
            Figma plugin
            <Legend>F</Legend>
          </Key>
        </div>
      </section>

      <section id="mcp" className="grid scroll-mt-16 gap-10 border-b border-line px-5 py-14 md:px-8 lg:grid-cols-[minmax(260px,380px)_1fr] lg:px-12 lg:py-20">
        <div className="flex flex-col gap-3">
          <Eyebrow index="01" label="MCP server" />
          <h2 className="font-heading text-[28px] leading-[34px] tracking-[-0.56px] text-ink">Ask for an asset, get the SVG.</h2>
          <p className="text-[15px] leading-6 text-ink-2">
            A remote MCP server with two tools: <code className="font-mono text-[13px] text-ink">search_assets</code> finds anything in the library, and{" "}
            <code className="font-mono text-[13px] text-ink">get_asset</code> returns it as ready-to-paste SVG (or CSS for gradients), with size, stroke, colour and
            isometric palette options.
          </p>
          <p className="font-mono text-[13px] leading-5 text-ink">{MCP_URL}</p>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <Code label="Claude Code">{`claude mcp add --transport http aerobox ${MCP_URL}`}</Code>
          <Code label="Cursor, VS Code, Windsurf (mcp.json)">{`{
  "mcpServers": {
    "aerobox": { "url": "${MCP_URL}" }
  }
}`}</Code>
          <Code label="Claude desktop and claude.ai">{`Settings → Connectors → Add custom connector
Name: Aerobox Assets
URL:  ${MCP_URL}`}</Code>
          <Code label="Try asking">{`"Find a calendar icon from Aerobox and give me the SVG at 20px in #2F6BFF"
"Use the Aerobox isometric rocket in the Mint palette for the empty state"
"Put the Aurora gradient from Aerobox behind the pricing hero"`}</Code>
        </div>
      </section>

      <section id="figma" className="grid scroll-mt-16 gap-10 border-b border-line px-5 py-14 md:px-8 lg:grid-cols-[minmax(260px,380px)_1fr] lg:px-12 lg:py-20">
        <div className="flex flex-col gap-3">
          <Eyebrow index="02" label="Figma plugin" />
          <h2 className="font-heading text-[28px] leading-[34px] tracking-[-0.56px] text-ink">Browse and drop in, without leaving Figma.</h2>
          <p className="text-[15px] leading-6 text-ink-2">
            Search every tab, pick icon stroke and colour, choose an isometric palette or your own two colours, and click to add. Gradients arrive as native Figma
            fills: select layers first to apply them, or get a new rectangle.
          </p>
          <div>
            <Key href="/downloads/aerobox-assets-figma.zip" variant="primary" capClassName="h-11 gap-2.5 pl-4 pr-3 text-[15px] font-medium">
              Download the plugin
              <Legend>↓</Legend>
            </Key>
          </div>
        </div>
        <ol className="flex flex-col gap-5">
          <Step n="1" title="Download and unzip">The zip holds manifest.json, code.js, ui.html and a short README.</Step>
          <Step n="2" title="Import it in Figma desktop">
            Plugins → Development → Import plugin from manifest, then choose <code className="font-mono text-[13px] text-ink">manifest.json</code>.
          </Step>
          <Step n="3" title="Run Aerobox Assets">Plugins → Development → Aerobox Assets. It loads the library from aeroboxstudio.com, so it needs a connection.</Step>
        </ol>
      </section>

      <section className="grid gap-10 px-5 py-14 md:px-8 lg:grid-cols-[minmax(260px,380px)_1fr] lg:px-12 lg:py-20">
        <div className="flex flex-col gap-3">
          <Eyebrow index="03" label="REST API" />
          <h2 className="font-heading text-[28px] leading-[34px] tracking-[-0.56px] text-ink">Plain URLs, open CORS.</h2>
          <p className="text-[15px] leading-6 text-ink-2">The same data the MCP server and the plugin use, for your own tools and scripts.</p>
        </div>
        <Code label="Endpoints">{`GET /api/assets                         what is in the library
GET /api/assets?q=rocket&type=icon      search
GET /api/assets/{type}?preview=1        a whole type with preview data
GET /api/assets/icon/calendar?size=20&color=%232F6BFF
GET /api/assets/isometric/robot-arm?palette=Mint
GET /api/assets/gradient/aurora         CSS and colours

types: icon, isometric, gradient, brand, mark, lockup, avatar, flag`}</Code>
      </section>
    </div>
  );
}
