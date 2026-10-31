import { NextResponse, type NextRequest } from "next/server";
import { isAssetType, renderAsset, type RenderOptions } from "@/lib/assets";
import { CACHE, CORS, options } from "../../cors";

/** GET /api/assets/{type}/{id}: the asset as SVG (default), or JSON with ?format=json. Brand logos redirect to their file. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  if (!isAssetType(type)) return NextResponse.json({ error: `Unknown type "${type}"` }, { status: 404, headers: CORS });
  const p = req.nextUrl.searchParams;
  const num = (k: string) => (p.get(k) ? Number(p.get(k)) || undefined : undefined);
  const opts: RenderOptions = {
    size: num("size"),
    stroke: num("stroke"),
    color: p.get("color") ?? undefined,
    style: p.get("style") === "sharp" ? "sharp" : undefined,
    palette: (p.get("palette") as RenderOptions["palette"]) ?? undefined,
    face: p.get("face") ?? undefined,
    accent: p.get("accent") ?? undefined,
    shadow: p.get("shadow") === "0" ? false : undefined,
    variant: (p.get("variant") as RenderOptions["variant"]) ?? undefined,
    shape: (p.get("shape") as RenderOptions["shape"]) ?? undefined,
  };
  const asset = renderAsset(type, decodeURIComponent(id), opts);
  if (!asset) return NextResponse.json({ error: `No ${type} called "${id}"` }, { status: 404, headers: CORS });
  if (asset.url) return NextResponse.redirect(new URL(asset.url, req.nextUrl.origin), { status: 302, headers: { ...CORS, ...CACHE } });
  if (p.get("format") === "json" || (type === "gradient" && p.get("format") !== "svg")) return NextResponse.json({ type, id, ...asset }, { headers: { ...CORS, ...CACHE } });
  return new Response(asset.svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", ...CORS, ...CACHE } });
}
export const OPTIONS = options;
