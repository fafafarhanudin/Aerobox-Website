import { NextResponse, type NextRequest } from "next/server";
import { ASSET_TYPES, counts, isAssetType, isoPalettes, isoTones, searchAssets } from "@/lib/assets";
import { CACHE, CORS, options } from "./cors";

/** GET /api/assets: what is in the library; with ?q= it searches every type (or ?type=) */
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const q = p.get("q");
  if (q !== null) {
    const type = p.get("type");
    const res = searchAssets(q, isAssetType(type) ? type : undefined, Math.min(Number(p.get("limit") ?? 24) || 24, 200), Number(p.get("offset") ?? 0) || 0);
    return NextResponse.json(res, { headers: { ...CORS, ...CACHE } });
  }
  return NextResponse.json(
    {
      name: "Aerobox Assets",
      site: "https://www.aeroboxstudio.com/library",
      types: ASSET_TYPES,
      counts,
      isometricPalettes: isoPalettes,
      isometricTones: isoTones,
      endpoints: {
        search: "/api/assets?q={query}&type={type}&limit=24",
        list: "/api/assets/{type}?q={query}",
        previews: "/api/assets/{type}?preview=1",
        asset: "/api/assets/{type}/{id}",
        mcp: "/mcp",
      },
    },
    { headers: { ...CORS, ...CACHE } },
  );
}
export const OPTIONS = options;
