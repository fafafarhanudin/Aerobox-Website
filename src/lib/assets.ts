import "server-only";
import { ICONS } from "../../library/src/data/icons";
import { ISO } from "../../library/src/data/iso";
import { GRADIENTS } from "../../library/src/data/gradients";
import { MARKS } from "../../library/src/data/logos";
import { LOCKUPS } from "../../library/src/data/lockups";
import { WORLD } from "../../library/src/data/world";
import { AVATARS, FLAGS } from "../../library/src/data/collections";
import { ISO_BASE, ISO_PALETTES, isoSvg, type IsoPalette } from "../../library/src/data/iso-palettes";

/**
 * Aerobox Assets as data, for the public API (/api/assets), the MCP server (/mcp) and the Figma plugin.
 * The source of truth is the library's own data (library/src/data); nothing here is copied.
 */

export const ASSET_TYPES = ["icon", "isometric", "gradient", "brand", "mark", "lockup", "avatar", "flag"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];
export type AssetItem = { type: AssetType; id: string; name: string; category: string };

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const catalogue: Record<AssetType, AssetItem[]> = {
  icon: ICONS.map((i) => ({ type: "icon", id: i.name, name: i.name.replace(/-/g, " "), category: i.cat })),
  isometric: ISO.map((t) => ({ type: "isometric", id: t.key, name: t.name, category: t.cat })),
  gradient: GRADIENTS.map((g) => ({ type: "gradient", id: slug(g.name), name: g.name, category: g.kind })),
  brand: WORLD.map((w) => ({ type: "brand", id: slug(w.name), name: w.name, category: w.cat })),
  mark: MARKS.map((m) => ({ type: "mark", id: slug(m.name), name: m.name, category: "Gradient mark" })),
  lockup: LOCKUPS.map((l) => ({ type: "lockup", id: slug(l.name), name: l.name, category: "Lockup" })),
  avatar: AVATARS.map((a) => ({ type: "avatar", id: a.id, name: a.name, category: a.age })),
  flag: FLAGS.map((f) => ({ type: "flag", id: f.code, name: f.name, category: "Flag" })),
};

export const counts = Object.fromEntries(ASSET_TYPES.map((t) => [t, catalogue[t].length])) as Record<AssetType, number>;
export const isoPalettes = Object.keys(ISO_PALETTES) as IsoPalette[];
/** the seven template tones and every palette's swap for them, so clients can recolour isometric art themselves */
export const isoTones = { base: ISO_BASE, palettes: ISO_PALETTES };

/** ranked search: exact id/name first, then prefix, then substring on name, id or category */
export function searchAssets(query: string, type?: AssetType, limit = 24, offset = 0) {
  const pool = type ? catalogue[type] : ASSET_TYPES.flatMap((t) => catalogue[t]);
  const q = query.trim().toLowerCase();
  if (!q) return { total: pool.length, items: pool.slice(offset, offset + limit) };
  const words = q.split(/\s+/);
  const scored: [number, AssetItem][] = [];
  for (const item of pool) {
    const hay = `${item.id} ${item.name.toLowerCase()} ${item.category.toLowerCase()}`;
    if (!words.every((w) => hay.includes(w))) continue;
    const name = item.name.toLowerCase();
    const score = item.id === q || name === q ? 0 : name.startsWith(q) || item.id.startsWith(q) ? 1 : 2;
    scored.push([score, item]);
  }
  scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name));
  return { total: scored.length, items: scored.slice(offset, offset + limit).map(([, i]) => i) };
}

export type RenderOptions = {
  size?: number;
  stroke?: number;
  color?: string;
  style?: "outline" | "sharp";
  palette?: IsoPalette;
  face?: string;
  accent?: string;
  shadow?: boolean;
  variant?: "light" | "dark" | "wordmark" | "wordmark-dark";
  shape?: "rectangle" | "radius" | "square" | "circle";
};

const color = (c: string | undefined, fallback: string) => (c && /^(#[0-9a-f]{3,8}|currentColor)$/i.test(c) ? c : fallback);

/** an asset as ready-to-use SVG markup, or a URL for brand logos (their files live in public/library/world) */
export function renderAsset(type: AssetType, id: string, o: RenderOptions = {}): { svg?: string; url?: string; css?: string; colors?: string[]; name: string } | null {
  switch (type) {
    case "icon": {
      const i = ICONS.find((x) => x.name === id);
      if (!i) return null;
      const size = o.size ?? 24;
      const sharp = o.style === "sharp";
      const body = sharp ? i.sharp : i.body;
      return {
        name: i.name,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color(o.color, "currentColor")}" stroke-width="${o.stroke ?? 1.5}" stroke-linecap="${sharp ? "square" : "round"}" stroke-linejoin="${sharp ? "miter" : "round"}">${body}</svg>`,
      };
    }
    case "isometric": {
      const t = ISO.find((x) => x.key === id);
      if (!t) return null;
      return { name: t.name, svg: isoSvg(t.svg, { palette: o.palette, face: o.face && color(o.face, ""), accent: o.accent && color(o.accent, ""), stroke: o.stroke, shadow: o.shadow, size: o.size }) };
    }
    case "gradient": {
      const g = GRADIENTS.find((x) => slug(x.name) === id);
      if (!g) return null;
      const w = o.size ?? 480;
      const h = Math.round(w * 0.625);
      return {
        name: g.name,
        css: g.css,
        colors: [...g.colors],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;background:${g.css}"></div></foreignObject></svg>`,
      };
    }
    case "brand": {
      const w = WORLD.find((x) => slug(x.name) === id);
      if (!w) return null;
      const f = w.files as Record<string, string | undefined>;
      const file = (o.variant && f[o.variant === "wordmark" ? "wm" : o.variant === "wordmark-dark" ? "wm-dark" : o.variant]) || f.light;
      return { name: w.name, url: `/library/world/${file}` };
    }
    case "mark": {
      const m = MARKS.find((x) => slug(x.name) === id);
      return m ? { name: m.name, svg: o.size ? m.svg.replace(/width="40" height="40"/, `width="${o.size}" height="${o.size}"`) : m.svg } : null;
    }
    case "lockup": {
      const l = LOCKUPS.find((x) => slug(x.name) === id);
      if (!l) return null;
      const w = 44 + l.name.length * 12 + 16;
      const mark = l.svg.replace('<svg width="40" height="40"', '<svg x="0" y="4" width="32" height="32"');
      return {
        name: l.name,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="40" viewBox="0 0 ${w} 40">${mark}<text x="42" y="27" font-family="Plus Jakarta Sans, Geist, sans-serif" font-weight="700" font-size="21" letter-spacing="-0.4" fill="#101828">${esc(l.name)}</text></svg>`,
      };
    }
    case "avatar": {
      const a = AVATARS.find((x) => x.id === id);
      const size = o.size ?? 64;
      return a ? { name: a.name, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">${a.svg}</svg>` } : null;
    }
    case "flag": {
      const f = FLAGS.find((x) => x.code === id);
      if (!f) return null;
      const shape = o.shape ?? "radius";
      const [x, y, w, h] = shape === "rectangle" || shape === "radius" ? [+f.x, +f.y, 21, 15] : [+f.x + 3, +f.y, 15, 15];
      const clip = shape === "circle" ? `<circle cx="${x + 7.5}" cy="${y + 7.5}" r="7.5"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${shape === "radius" ? 2 : shape === "square" ? 1 : 0}"/>`;
      const size = o.size ?? 64;
      return {
        name: f.name,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round((size * h) / w)}" viewBox="${x} ${y} ${w} ${h}"><defs><clipPath id="fl-${f.code}">${clip}</clipPath></defs><g clip-path="url(#fl-${f.code})">${f.svg}</g></svg>`,
      };
    }
  }
}

/** the lightweight payload the Figma plugin needs to draw a whole tab of previews at once */
export function previewList(type: AssetType) {
  switch (type) {
    case "icon":
      return ICONS.map((i) => ({ id: i.name, name: i.name, category: i.cat, body: i.body, sharp: i.sharp }));
    case "isometric":
      return ISO.map((t) => ({ id: t.key, name: t.name, category: t.cat, art: t.svg }));
    case "gradient":
      return GRADIENTS.map((g) => ({ id: slug(g.name), name: g.name, category: g.kind, css: g.css, colors: g.colors }));
    case "brand":
      return WORLD.map((w) => ({ id: slug(w.name), name: w.name, category: w.cat, files: w.files }));
    case "mark":
      return MARKS.map((m) => ({ id: slug(m.name), name: m.name, category: "Gradient mark", svg: m.svg }));
    case "lockup":
      return LOCKUPS.map((l) => ({ id: slug(l.name), name: l.name, category: "Lockup", svg: renderAsset("lockup", slug(l.name))!.svg }));
    case "avatar":
      return AVATARS.map((a) => ({ id: a.id, name: a.name, category: a.age, svg: renderAsset("avatar", a.id)!.svg }));
    case "flag":
      return FLAGS.map((f) => ({ id: f.code, name: f.name, category: "Flag", svg: renderAsset("flag", f.code)!.svg }));
  }
}

export const isAssetType = (t: string | null | undefined): t is AssetType => !!t && (ASSET_TYPES as readonly string[]).includes(t);
