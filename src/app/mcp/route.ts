import { NextResponse, type NextRequest } from "next/server";
import { ASSET_TYPES, counts, isAssetType, isoPalettes, renderAsset, searchAssets, type RenderOptions } from "@/lib/assets";

/**
 * Aerobox Assets as a remote MCP server (Streamable HTTP, stateless): POST JSON-RPC, answered as plain JSON.
 * Add it with `claude mcp add --transport http aerobox https://www.aeroboxstudio.com/mcp`, or as a custom
 * connector / mcp.json URL in other clients. A browser opening /mcp is sent to the setup page.
 */

const PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER = { name: "aerobox-assets", title: "Aerobox Assets", version: "1.0.0" };
const INSTRUCTIONS = `Aerobox Assets is a free design library: ${counts.icon} icons, ${counts.isometric} isometric illustrations, ${counts.gradient} gradients, ${counts.brand} brand logos, ${counts.mark + counts.lockup} logo templates, ${counts.avatar} avatars and ${counts.flag} flags. Use search_assets to find ids, then get_asset to get SVG markup (or CSS for gradients) ready to paste into code or design files. Isometric illustrations take a palette (${isoPalettes.join(", ")}) or two custom hex colours (face, accent).`;

const typeEnum = { type: "string", enum: [...ASSET_TYPES] };
const TOOLS = [
  {
    name: "search_assets",
    title: "Search Aerobox Assets",
    description:
      "Search the Aerobox Assets library by keyword. Returns matching assets with their type and id for get_asset. Leave query empty to browse a type or category.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords, e.g. 'calendar', 'rocket', 'sunset gradient', 'stripe'" },
        type: { ...typeEnum, description: "Limit to one type" },
        category: { type: "string", description: "Limit to a category, e.g. 'Finance' for isometric or 'AI' for brands" },
        limit: { type: "integer", minimum: 1, maximum: 50, default: 12 },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_asset",
    title: "Get an Aerobox asset",
    description:
      "Get one asset as ready-to-use SVG markup (gradients come back as CSS). Options apply where they make sense: icons take size, stroke, color and style; isometric takes palette or face+accent colours, stroke and shadow; brand logos take variant; flags take shape.",
    inputSchema: {
      type: "object",
      properties: {
        type: typeEnum,
        id: { type: "string", description: "The id from search_assets" },
        size: { type: "number", description: "Width in px (icons default 24, isometric 240, avatars and flags 64)" },
        stroke: { type: "number", description: "Stroke width: icons default 1.5, isometric outline 1.5" },
        color: { type: "string", description: "Icon colour as hex, or currentColor (default)" },
        style: { type: "string", enum: ["outline", "sharp"], description: "Icon corners" },
        palette: { type: "string", enum: isoPalettes, description: "Isometric palette (default Coral)" },
        face: { type: "string", description: "Isometric custom face colour (hex), used with accent" },
        accent: { type: "string", description: "Isometric custom accent colour (hex), used with face" },
        shadow: { type: "boolean", description: "Isometric hard shadow (default true)" },
        variant: { type: "string", enum: ["light", "dark", "wordmark", "wordmark-dark"], description: "Brand logo version" },
        shape: { type: "string", enum: ["rectangle", "radius", "square", "circle"], description: "Flag shape" },
      },
      required: ["type", "id"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

type Rpc = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> };
const ok = (id: Rpc["id"], result: unknown) => ({ jsonrpc: "2.0", id, result });
const fail = (id: Rpc["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const text = (t: string, structured?: unknown, isError = false) => ({ content: [{ type: "text", text: t }], ...(structured ? { structuredContent: structured } : {}), ...(isError ? { isError } : {}) });

async function callTool(name: string, args: Record<string, unknown>, origin: string) {
  if (name === "search_assets") {
    const type = typeof args.type === "string" && isAssetType(args.type) ? args.type : undefined;
    const limit = Math.min(Math.max(Number(args.limit) || 12, 1), 50);
    const query = [String(args.query ?? ""), typeof args.category === "string" ? args.category : ""].join(" ").trim();
    const { total, items } = searchAssets(query, type, limit);
    if (!items.length) return text(`No assets match "${query}"${type ? ` in ${type}` : ""}. Try a broader word.`, { total: 0, items: [] });
    const lines = items.map((i) => `- ${i.type}/${i.id}: ${i.name} (${i.category})`);
    return text(`${total} match${total === 1 ? "" : "es"}${total > items.length ? `, showing ${items.length}` : ""}:\n${lines.join("\n")}\n\nUse get_asset with the type and id.`, { total, items });
  }
  if (name === "get_asset") {
    const type = String(args.type ?? "");
    if (!isAssetType(type)) return text(`Unknown type "${type}". Types: ${ASSET_TYPES.join(", ")}.`, undefined, true);
    const id = String(args.id ?? "");
    const asset = renderAsset(type, id, args as RenderOptions);
    if (!asset) return text(`No ${type} with id "${id}". Use search_assets to find ids.`, undefined, true);
    const page = `https://www.aeroboxstudio.com/api/assets/${type}/${encodeURIComponent(id)}`;
    if (asset.url) {
      const res = await fetch(new URL(asset.url, origin));
      if (!res.ok) return text(`Could not load ${asset.name}.`, undefined, true);
      return text(await res.text(), { type, id, name: asset.name, url: new URL(asset.url, "https://www.aeroboxstudio.com").href });
    }
    if (type === "gradient") {
      const css = `background: ${asset.css};`;
      return text(`${asset.name}\n\nCSS:\n${css}\n\nTailwind:\nbg-[${asset.css!.replace(/\s+/g, "_")}]\n\nColours: ${asset.colors!.join(", ")}`, { type, id, name: asset.name, css: asset.css, colors: asset.colors });
    }
    return text(asset.svg!, { type, id, name: asset.name, url: page });
  }
  return null;
}

async function handle(msg: Rpc, origin: string) {
  if (msg.id === undefined || msg.id === null) return null; // notifications get no answer
  switch (msg.method) {
    case "initialize": {
      const asked = String(msg.params?.protocolVersion ?? "");
      return ok(msg.id, {
        protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER,
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return ok(msg.id, {});
    case "tools/list":
      return ok(msg.id, { tools: TOOLS });
    case "tools/call": {
      const name = String(msg.params?.name ?? "");
      const result = await callTool(name, (msg.params?.arguments as Record<string, unknown>) ?? {}, origin);
      return result ? ok(msg.id, result) : fail(msg.id, -32602, `Unknown tool "${name}"`);
    }
    case "resources/list":
      return ok(msg.id, { resources: [] });
    case "prompts/list":
      return ok(msg.id, { prompts: [] });
    default:
      return fail(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

const HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Expose-Headers": "Mcp-Session-Id" };

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(fail(null, -32700, "Parse error"), { status: 400, headers: HEADERS });
  }
  const origin = req.nextUrl.origin;
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((m) => handle(m as Rpc, origin)))).filter(Boolean);
    return out.length ? NextResponse.json(out, { headers: HEADERS }) : new Response(null, { status: 202, headers: HEADERS });
  }
  const msg = body as Rpc;
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return NextResponse.json(fail(null, -32600, "Invalid Request"), { status: 400, headers: HEADERS });
  const out = await handle(msg, origin);
  return out ? NextResponse.json(out, { headers: HEADERS }) : new Response(null, { status: 202, headers: HEADERS });
}

/** no server-to-client stream; a browser gets the setup page instead */
export function GET(req: NextRequest) {
  if (req.headers.get("accept")?.includes("text/html")) return NextResponse.redirect(new URL("/integrations", req.nextUrl.origin));
  return new Response("This MCP server answers POST requests (Streamable HTTP).", { status: 405, headers: { Allow: "POST", ...HEADERS } });
}

export function DELETE() {
  return new Response(null, { status: 405, headers: { Allow: "POST", ...HEADERS } });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...HEADERS, "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version, Authorization" },
  });
}
