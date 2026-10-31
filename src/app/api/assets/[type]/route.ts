import { NextResponse, type NextRequest } from "next/server";
import { isAssetType, previewList, searchAssets } from "@/lib/assets";
import { CACHE, CORS, options } from "../cors";

/** GET /api/assets/{type}: a page of items (?q, limit, offset), or every item with preview data (?preview=1) */
export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isAssetType(type)) return NextResponse.json({ error: `Unknown type "${type}"` }, { status: 404, headers: CORS });
  const p = req.nextUrl.searchParams;
  if (p.get("preview") === "1") return NextResponse.json({ type, items: previewList(type) }, { headers: { ...CORS, ...CACHE } });
  const res = searchAssets(p.get("q") ?? "", type, Math.min(Number(p.get("limit") ?? 48) || 48, 500), Number(p.get("offset") ?? 0) || 0);
  return NextResponse.json({ type, ...res }, { headers: { ...CORS, ...CACHE } });
}
export const OPTIONS = options;
