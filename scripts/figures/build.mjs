// Builds the isometric figures for the Services and Process sections (anatomy kit, iso-kit.mjs).
// Static art is precomputed here; parts that move are wrapped in <g data-part> and moved in the page
// by components/figures/animator.tsx along the screen vectors stored on the <svg> (data-u).
// Run: node scripts/figures/build.mjs  →  public/figures/*.svg + src/app/iso.css

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./iso-kit.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function kitFor(P) {
  const at = (p) => k.iso(p, P);
  const S = (paths, o) => k.solidSvg(paths, o);
  const L = (d, o) => k.lineSvg(d, o);
  const D = (pts, o) => k.dotsSvg(pts, o);
  const slab = (plan, z, h, o = {}, steps = 4, bevel = 0.5) => S(k.slabOf(plan, z, h, P, steps, bevel), o);
  const cyl = (x, y, r, z, h, o = {}, steps = 28) => S(k.cylinder(x, y, r, z, h, P, steps), o);
  const top = (pts, z, o = {}, closed = false) => L(k.onTop(pts, z, P, closed), o);
  const outline = (plan, z, o = {}, steps = 4) => L(k.planOutline(plan, z, P, steps), o);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  const screws = (pts, z, r = 1.8) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.45 });
  const text = (x, y, z, value, o = {}) => k.faceTextSvg(k.topMatrix([x, y], z, P), value, { size: 3, tone: "mid", ...o });

  // a machined base plate on four feet, with a groove, corner screws, a ruler strip and a label plate
  function base(plan, { h = 8, foot = 4, label = "", ruler = true } = {}) {
    const z0 = -h - foot;
    const out = [`<path class="iso-halo" d="${k.haloOf(plan, z0, h, P)}"/>`];
    for (const [x, y] of byDepth(k.corners(plan, 16))) out.push(cyl(x, y, 6, z0, 1.4, { tone: "lo" }, 24), cyl(x, y, 4.6, z0 + 1.4, foot - 1.4, { tone: "mid" }, 24));
    out.push(S(k.slabOf(plan, -h, h, P, 8, 1.4), { tone: "mid" }));
    out.push(outline(k.insetPlan(plan, 4), 0, { tone: "faint" }, 8));
    out.push(screws(k.corners(plan, 9), 0));
    if (ruler) {
      const strip = { x: plan.x + 18, y: plan.y + plan.d - 12, w: Math.round(plan.w * 0.5), d: 6, r: 1 };
      out.push(slab(strip, 0, 0.6, { tone: "lo", crease: "none" }, 3, 0));
      const t = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 3, 5, strip.y + 0.6, 0.6, [1.6, 3], P);
      out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
    }
    if (label) {
      const plate = { x: plan.x + plan.w - 44, y: plan.y + plan.d - 15, w: 30, d: 9, r: 1 };
      out.push(slab(plate, 0, 0.6, { tone: "lo" }, 3, 0.2));
      out.push(text(plate.x + 3, plate.y + 6, 0.6, label, { size: 3.4 }));
      out.push(D([at([plate.x + plate.w - 2.5, plate.y + 2.5, 0.6]), at([plate.x + plate.w - 2.5, plate.y + plate.d - 2.5, 0.6])], { size: 0.4 }));
    }
    return out.join("");
  }

  // a vertical spring, split into the turns behind the rod and the turns in front of it
  function vcoil(cx, cy, r, z0, z1, turns, per = 16) {
    const [vx, vy] = k.towardViewer(P);
    const count = Math.round(turns * per);
    const back = [];
    const front = [];
    let run = [];
    let near = null;
    for (let i = 0; i <= count; i++) {
      const share = i / count;
      const a = share * turns * Math.PI * 2;
      const p = at([cx + r * Math.cos(a), cy + r * Math.sin(a), z0 + (z1 - z0) * share]);
      const facing = Math.cos(a) * vx + Math.sin(a) * vy > 0;
      if (near === null) near = facing;
      if (facing !== near) {
        run.push(p);
        (near ? front : back).push(k.pathOf(run));
        run = [p];
        near = facing;
        continue;
      }
      run.push(p);
    }
    if (run.length > 1) (near ? front : back).push(k.pathOf(run));
    return { back: back.join(""), front: front.join("") };
  }

  return { at, S, L, D, slab, cyl, top, outline, byDepth, screws, text, base, vcoil };
}

const r2 = (v) => Math.round(v * 1000) / 1000;
function part(name, inner, { o, anchor, drive } = {}) {
  const style = o === undefined ? "" : ` style="opacity:${o}"`;
  const pin = anchor ? ` data-anchor="${r2(anchor[0])} ${r2(anchor[1])}"` : "";
  return `<g data-part="${name}"${style}${pin}${drive ? " data-drive" : ""}>${Array.isArray(inner) ? inner.join("") : inner}</g>`;
}
// a line that draws itself: the page moves stroke-dashoffset from 1 to 0 (channel d)
const ink = (P, points, tone = "lit", width = 1.3) =>
  `<path class="iso-line" data-tone="${tone}" pathLength="1" style="stroke-dasharray:1;vector-effect:none;stroke-width:${width}" d="${k.pathOf(points.map((q) => k.iso(q, P)))}"/>`;
function svgOf(P, w, h, label, body) {
  const u = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].flatMap((v) => k.axisVector(P, v).map(r2)).join(" ");
  return k.figureSvg({ width: w, height: h, label, body: body.join("") }).replace("<svg", `<svg data-u="${u}"`);
}

/* Fig 1, product design: a layout bench. A gantry picks a component tile from the stock tray and sets it into
   the empty slot of a dashboard laid out on the bench. */
function product() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -112, y: -58, w: 214, d: 116, r: 6 };
  const Y = -13;
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-110, -17, 68], [98, -19, 81], [-110, -9, 68]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, top, outline, screws, base } = kitFor(P);
  const TILE = (cx) => ({ x: cx - 12, y: Y - 9, w: 24, d: 18, r: 1.2 });
  const out = [base(PLATE, { label: "PD-01" })];

  // far post
  out.push(slab({ x: -111, y: -22, w: 14, d: 18, r: 2 }, 0, 4, { tone: "mid" }), screws([[-108, -19], [-108, -7]], 4, 1.1));
  out.push(slab({ x: -108, y: -17, w: 8, d: 8, r: 1 }, 4, 58, { tone: "mid" }));

  // stock tray with two tiles
  const TRAY = { x: -84, y: -28, w: 28, d: 30, r: 2 };
  out.push(slab(TRAY, 0, 3, { tone: "mid" }), outline(k.insetPlan(TRAY, 1.6), 3, { tone: "faint" }, 3));
  out.push(slab(TILE(-70), 3, 1.2, { tone: "mid" }, 3, 0.3));
  out.push(part("pick", slab(TILE(-70), 4.2, 1.2, { tone: "hi", lit: true }, 3, 0.3)));

  // the dashboard being laid out
  const CANVAS = { x: -48, y: -40, w: 106, d: 80, r: 3 };
  out.push(slab(CANVAS, 0, 2, { tone: "mid" }, 6, 0.4));
  out.push(slab({ x: -44, y: -36, w: 16, d: 72, r: 1.2 }, 2, 1, { tone: "lo" }, 3, 0.2));
  out.push(L([-28, -20, -12, -4, 4].map((y) => k.lineOnTop([-41, y], [-32, y], 3, P)).join(""), { tone: "mid" }));
  out.push(outline({ x: -42, y: -34, w: 5, d: 4, r: 1 }, 3, { tone: "hi" }, 2));
  out.push(slab({ x: -24, y: -36, w: 78, d: 10, r: 1.2 }, 2, 1, { tone: "lo" }, 3, 0.2));
  out.push(top([[-20, -31], [-4, -31]], 3, { tone: "mid" }), outline({ x: 30, y: -34, w: 20, d: 6, r: 2 }, 3, { tone: "lo" }, 3));
  for (const cx of [-12, 42]) {
    out.push(slab(TILE(cx), 2, 1.2, { tone: "mid" }, 3, 0.3));
    out.push(top([[cx - 9, Y - 5], [cx - 1, Y - 5]], 3.2, { tone: "mid" }));
    out.push(top([[cx - 9, Y + 5], [cx - 5, Y + 2], [cx - 1, Y + 4], [cx + 3, Y], [cx + 8, Y + 1]], 3.2, { tone: "hi" }));
  }
  out.push(outline(TILE(15), 2, { tone: "mid", dashed: true }, 3));
  out.push(D(k.corners(TILE(15), 0).map(([x, y]) => at([x, y, 2])), { size: 0.5, tone: "hi" }));
  out.push(slab({ x: -24, y: 0, w: 78, d: 36, r: 1.2 }, 2, 1.2, { tone: "mid" }, 3, 0.3));
  out.push(L([10, 18, 26].map((y) => k.lineOnTop([-20, y], [50, y], 3.2, P)).join(""), { tone: "faint" }));
  out.push(top([[-20, 28], [-8, 20], [4, 24], [16, 12], [28, 16], [40, 6], [50, 9]], 3.2, { tone: "hi" }));
  const ticks = k.topTicks(-20, 50, 5, 5, 31.5, 3.2, [1.2, 2.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(part("placed", slab(TILE(15), 2, 1.2, { tone: "hi", lit: true }, 3, 0.3), { o: 0 }));

  // the head: a Z rod with a vacuum pad, riding a carriage along the bridge
  const zArm = [
    part("carry", slab(TILE(-70), 18.8, 1.2, { tone: "hi", lit: true }, 3, 0.3), { o: 0 }),
    cyl(-70, Y, 5, 20, 2, { tone: "mid" }, 28),
    cyl(-70, Y, 2.2, 22, 2, { tone: "mid" }, 18),
    cyl(-70, Y, 1.3, 24, 36, { tone: "mid", crease: "none" }, 16),
  ];
  const head = [
    part("z", zArm),
    cyl(-70, Y, 2.6, 40, 10, { tone: "mid" }, 20),
    L(k.sideArc(-70, Y, 2.6, 44, P, 12), { tone: "faint" }),
    slab({ x: -79, y: -22, w: 18, d: 18, r: 2 }, 50, 12, { tone: "mid" }, 4, 0.6),
    D([[-77, -20], [-63, -20], [-77, -6], [-63, -6]].map(([x, y]) => at([x, y, 62])), { size: 0.45 }),
  ];
  out.push(part("x", head));

  // bridge, rails and the near post with its motor
  out.push(slab({ x: -110, y: -17, w: 208, d: 8, r: 1 }, 62, 6, { tone: "mid" }, 3, 0.5));
  out.push(L(k.lineOnTop([-106, -15], [84, -15], 68, P) + k.lineOnTop([-106, -11], [84, -11], 68, P), { tone: "faint" }));
  out.push(D([at([-106, -13, 68]), at([82, -13, 68])], { size: 0.45 }));
  out.push(slab({ x: 85, y: -22, w: 14, d: 18, r: 2 }, 0, 4, { tone: "mid" }), screws([[96, -19], [96, -7]], 4, 1.1));
  out.push(slab({ x: 88, y: -17, w: 8, d: 8, r: 1 }, 4, 58, { tone: "mid" }));
  out.push(slab({ x: 86, y: -19, w: 12, d: 12, r: 2 }, 68, 10, { tone: "mid" }, 4, 0.6));
  out.push(cyl(92, -13, 3, 78, 3, { tone: "mid" }, 24), L(k.knurl(92, -13, 3, 78, 81, 20, P), { tone: "lo" }));
  return svgOf(P, W, H, "A gantry setting a component tile into a dashboard layout", out);
}

/* Fig 2, websites: a printer's chase. Page sections drop into the frame one by one, then the quoin key locks them. */
function web() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -96, y: -70, w: 192, d: 140, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-62, -62, 30], [62, 54, 12]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, top, outline, screws, base } = kitFor(P);
  const out = [base(PLATE, { label: "WB-02" })];
  const BAR = 9;

  out.push(slab({ x: -62, y: -62, w: 124, d: 7, r: 1.2 }, 0, BAR, { tone: "mid" }, 3, 0.5));
  out.push(slab({ x: -62, y: -55, w: 7, d: 102, r: 1.2 }, 0, BAR, { tone: "mid" }, 3, 0.5));
  out.push(screws([[-58.5, -58.5]], BAR, 1.2));

  const B = (y, d) => ({ x: -52, y, w: 104, d, r: 1.2 });
  const nav = [
    slab(B(-53, 8), 0, 6, { tone: "mid" }, 3, 0.4),
    outline({ x: -48, y: -51, w: 4, d: 4, r: 0.8 }, 6, { tone: "hi" }, 2),
    L([[-12, -4], [0, 8], [12, 20]].map(([a, b]) => k.lineOnTop([a, -49], [b, -49], 6, P)).join(""), { tone: "mid" }),
    outline({ x: 34, y: -51.5, w: 14, d: 5, r: 2 }, 6, { tone: "mid" }, 3),
  ];
  const hero = [
    slab(B(-43, 30), 0, 6, { tone: "hi", lit: true }, 3, 0.4),
    slab({ x: -38, y: -39, w: 76, d: 4, r: 0.6 }, 6, 0.5, { tone: "mid", crease: "none" }, 2, 0),
    slab({ x: -28, y: -33, w: 56, d: 4, r: 0.6 }, 6, 0.5, { tone: "mid", crease: "none" }, 2, 0),
    top([[-22, -25.5], [22, -25.5]], 6, { tone: "lo" }),
    slab({ x: -10, y: -22, w: 20, d: 5, r: 2.4 }, 6, 1, { tone: "mid" }, 4, 0.2),
  ];
  const features = [slab(B(-11, 24), 0, 6, { tone: "mid" }, 3, 0.4)];
  for (const i of [0, 1, 2]) {
    const x = -48 + i * 33;
    features.push(outline({ x, y: -8, w: 30, d: 18, r: 1.5 }, 6, { tone: "lo" }, 3));
    features.push(L(k.ring(x + 6, -2, 2.4, 6, P, 16), { tone: "mid" }));
    features.push(top([[x + 4, 4], [x + 24, 4]], 6, { tone: "mid" }), top([[x + 4, 7], [x + 18, 7]], 6, { tone: "lo" }));
  }
  const footer = [slab(B(15, 12), 0, 6, { tone: "mid" }, 3, 0.4)];
  for (const i of [0, 1, 2, 3]) {
    const x = -47 + i * 26;
    footer.push(top([[x, 19], [x + 14, 19]], 6, { tone: "mid" }), top([[x, 23], [x + 9, 23]], 6, { tone: "lo" }));
  }
  [nav, hero, features, footer].forEach((block, i) => out.push(part(`b${i}`, block)));

  // quoins and key
  for (const y of [30, 38]) {
    out.push(slab({ x: -44, y, w: 88, d: 6, r: 0.8 }, 0, 5, { tone: "mid" }, 3, 0.4));
    out.push(top([[-44, y + 0.6], [44, y + 5.4]], 5, { tone: "faint" }));
  }
  out.push(cyl(0, 37, 2, 5, 4, { tone: "mid" }, 18), cyl(0, 37, 3.2, 9, 2, { tone: "mid" }, 24), L(k.knurl(0, 37, 3.2, 9, 11, 18, P), { tone: "lo" }));
  out.push(part("keyA", slab({ x: -10, y: 36, w: 20, d: 2, r: 0.8 }, 11, 1.4, { tone: "hi" }, 2, 0.2)));
  out.push(part("keyB", slab({ x: -1, y: 28, w: 2, d: 18, r: 0.8 }, 11, 1.4, { tone: "hi" }, 2, 0.2), { o: 0 }));
  out.push(D([at([0, 37, 12.4])], { size: 0.5, tone: "hi" }));

  out.push(slab({ x: 55, y: -55, w: 7, d: 102, r: 1.2 }, 0, BAR, { tone: "mid" }, 3, 0.5));
  out.push(slab({ x: -62, y: 47, w: 124, d: 7, r: 1.2 }, 0, BAR, { tone: "mid" }, 3, 0.5));
  out.push(screws([[58.5, -58.5], [-58.5, 50.5], [58.5, 50.5]], BAR, 1.2));
  const t = k.topTicks(-50, 50, 4, 5, 47.8, BAR, [1.2, 2.4], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));

  // a planer block beside the chase
  out.push(slab({ x: 68, y: -40, w: 18, d: 44, r: 2 }, 0, 7, { tone: "mid" }, 4, 0.6));
  out.push(outline({ x: 70.5, y: -37.5, w: 13, d: 39, r: 1 }, 7, { tone: "faint" }, 3));
  out.push(cyl(77, -18, 4, 7, 5, { tone: "mid" }, 24), L(k.knurl(77, -18, 4, 7, 12, 22, P), { tone: "lo" }));
  return svgOf(P, W, H, "Page sections dropping into a printer's chase and locked with a quoin key", out);
}

/* Fig 3, mobile apps: a phone in a test cradle. A finger probe taps the screen and the feed scrolls one card. */
function mobile() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -92, y: -66, w: 184, d: 138, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [58, 8, 86], [0, 2, 84], [-6, 8, 82]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, top, outline, screws, base, vcoil } = kitFor(P);
  const out = [base(PLATE, { label: "MB-03" })];

  const MAT = { x: -34, y: -58, w: 68, d: 116, r: 4 };
  out.push(slab(MAT, 0, 4, { tone: "lo" }, 6, 0.4));
  out.push(L([-46, -30, 30, 46].map((y) => k.lineOnTop([-31, y], [31, y], 4, P)).join(""), { tone: "faint" }));
  out.push(slab({ x: -30, y: -61, w: 60, d: 7, r: 1.5 }, 0, 14, { tone: "mid" }, 3, 0.5), screws([[-24, -57.5], [24, -57.5]], 14, 1.1));

  const PHONE = { x: -27, y: -52, w: 54, d: 104, r: 9 };
  const SCREEN = { x: -24, y: -49, w: 48, d: 98, r: 7 };
  out.push(slab(PHONE, 4, 6, { tone: "mid" }, 8, 0.8));
  out.push(slab({ x: 27, y: -30, w: 1, d: 10, r: 0.4 }, 6, 2.5, { tone: "mid" }, 2, 0), slab({ x: 27, y: -16, w: 1, d: 6, r: 0.4 }, 6, 2.5, { tone: "mid" }, 2, 0));
  const glass = k.planOutline(SCREEN, 10, P, 8);
  out.push(`<clipPath id="fig-mobile-screen"><path d="${glass}"/></clipPath>`);
  const cards = [];
  for (let i = 0; i < 8; i++) {
    const y = -40 + i * 20;
    cards.push(outline({ x: -20, y, w: 40, d: 16, r: 2.5 }, 10, { tone: i === 1 ? "hi" : "mid" }, 3));
    cards.push(L(k.ring(-14, y + 8, 3.2, 10, P, 16), { tone: "mid" }));
    cards.push(top([[-8, y + 6], [13, y + 6]], 10, { tone: "mid" }), top([[-8, y + 10.5], [5, y + 10.5]], 10, { tone: "lo" }));
  }
  out.push(`<g clip-path="url(#fig-mobile-screen)">${part("feed", cards)}${part("ripple", L(k.ring(0, 8, 3, 10, P, 24), { tone: "hi" }), { o: 0, anchor: at([0, 8, 10]) })}</g>`);
  out.push(L(glass, { tone: "lit" }));
  out.push(outline({ x: -6, y: -46.5, w: 12, d: 3, r: 1.5 }, 10, { tone: "mid" }, 3));
  out.push(slab({ x: -24, y: 38, w: 48, d: 11, r: 0 }, 10, 0.1, { tone: "lo", crease: "none" }, 1, 0));
  out.push(L(k.lineOnTop([-24, 38], [24, 38], 10.1, P), { tone: "lo" }), D([-15, -5, 5, 15].map((x) => at([x, 43.5, 10.1])), { size: 0.55, tone: "mid" }));
  out.push(slab({ x: -30, y: 52, w: 60, d: 7, r: 1.5 }, 0, 14, { tone: "mid" }, 3, 0.5));
  out.push(slab({ x: -1.4, y: 59, w: 2.8, d: 3, r: 0.6 }, 6, 2.6, { tone: "mid", crease: "none" }, 2, 0));
  out.push(cyl(0, 64.4, 3.4, 4, 6, { tone: "mid" }, 24), L(k.knurl(0, 64.4, 3.4, 4, 10, 20, P), { tone: "lo" }));

  // the probe: post, clamp, arm, housing and a sprung plunger with a soft tip
  out.push(cyl(58, 8, 9, 0, 3, { tone: "mid" }, 32), screws([[52, 2], [64, 14]], 3, 1));
  out.push(cyl(58, 8, 4.6, 3, 83, { tone: "mid", crease: "none" }, 24));
  out.push(cyl(58, 8, 5.2, 86, 2, { tone: "mid" }, 24));
  out.push(slab({ x: 51, y: 1, w: 14, d: 14, r: 2 }, 70, 12, { tone: "mid" }, 4, 0.6));
  out.push(cyl(58, 17, 2.4, 73, 6, { tone: "mid" }, 18), L(k.knurl(58, 17, 2.4, 73, 79, 14, P), { tone: "lo" }));
  out.push(slab({ x: 4, y: 5, w: 48, d: 6, r: 1.5 }, 74, 6, { tone: "mid" }, 3, 0.5));
  out.push(D([at([14, 8, 80]), at([42, 8, 80])], { size: 0.45 }));
  const spring = vcoil(0, 8, 3.4, 42, 64, 5.5);
  out.push(part("coilB", L(spring.back, { tone: "lo" }), { anchor: at([0, 8, 64]) }));
  out.push(
    part("tip", [
      cyl(0, 8, 3, 21, 1, { tone: "mid" }, 22),
      cyl(0, 8, 3.6, 22, 4, { tone: "hi" }, 24),
      cyl(0, 8, 1.4, 26, 54, { tone: "mid", crease: "none" }, 14),
      cyl(0, 8, 3, 40, 2, { tone: "mid" }, 20),
    ]),
  );
  out.push(part("coilF", L(spring.front, { tone: "mid" }), { anchor: at([0, 8, 64]) }));
  out.push(cyl(0, 8, 6, 64, 18, { tone: "mid" }, 28), L(k.sideArc(0, 8, 6, 70, P, 16), { tone: "faint" }));
  out.push(cyl(0, 8, 3, 82, 2, { tone: "mid" }, 22), D([at([0, 8, 84])], { size: 0.5, tone: "hi" }));
  return svgOf(P, W, H, "A finger probe tapping a phone in a test cradle", out);
}

/* Fig 4, brand and motion: a stamp press. A blank card slides under the die, the ram presses the mark onto it,
   and the card moves on to the finished stack. */
function brand() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -96, y: -66, w: 192, d: 132, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-10, -54, 108], [40, -30, 106], [0, 9, 96]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, top, outline, screws, base } = kitFor(P);
  const out = [base(PLATE, { label: "BR-04" })];

  out.push(slab({ x: -16, y: -64, w: 32, d: 26, r: 2 }, 0, 6, { tone: "mid" }, 4, 0.6), screws([[-12, -60], [12, -60]], 6, 1.2));
  out.push(slab({ x: -8, y: -58, w: 16, d: 16, r: 2 }, 6, 90, { tone: "mid" }, 4, 0.6));
  out.push(L([30, 60].map((z) => k.sideSeam({ x: -8, y: -58, w: 16, d: 16, r: 2 }, z, P, 4)).join(""), { tone: "faint" }));

  const BED = { x: -48, y: -26, w: 96, d: 52, r: 3 };
  out.push(slab(BED, 0, 6, { tone: "mid" }, 6, 0.6));
  out.push(L(k.lineOnTop([-46, -16], [46, -16], 6, P) + k.lineOnTop([-46, 16], [46, 16], 6, P), { tone: "faint" }));
  out.push(slab({ x: -26, y: -17, w: 52, d: 34, r: 1 }, 6, 0.2, { tone: "lo", crease: "none" }, 2, 0));
  out.push(D(k.corners({ x: -24, y: -15, w: 48, d: 30 }, 0).map(([x, y]) => at([x, y, 6.2])), { size: 0.5, tone: "mid" }));

  const TRAY = { x: 54, y: -22, w: 36, d: 44, r: 2 };
  out.push(slab(TRAY, 0, 3, { tone: "mid" }, 4, 0.4));
  for (const z of [3, 4.2]) out.push(slab({ x: 50, y: -13, w: 44, d: 26, r: 1.5 }, z, 1.2, { tone: "mid" }, 3, 0.3));

  const CARD = { x: -22, y: -13, w: 44, d: 26, r: 1.5 };
  const mark = [
    L(k.ring(-12, 0, 5, 7.2, P, 24), { tone: "hi" }),
    top([[-15.5, 3.5], [-8.5, -3.5]], 7.2, { tone: "hi" }),
    top([[-3, -3], [15, -3]], 7.2, { tone: "mid" }),
    top([[-3, 2], [9, 2]], 7.2, { tone: "lo" }),
  ];
  out.push(part("card", [slab(CARD, 6, 1.2, { tone: "hi", lit: true }, 3, 0.3), part("mark", mark)]));

  // ram: rod, holder, block and rubber die
  out.push(
    part("ram", [
      slab({ x: -24, y: -14, w: 48, d: 28, r: 1.5 }, 24, 2, { tone: "lo" }, 3, 0.2),
      slab({ x: -26, y: -16, w: 52, d: 32, r: 2 }, 26, 8, { tone: "mid" }, 4, 0.6),
      outline({ x: -23, y: -13, w: 46, d: 26, r: 1 }, 34, { tone: "faint" }, 3),
      cyl(0, 0, 6, 34, 6, { tone: "mid" }, 26),
      cyl(0, 0, 3.2, 40, 50, { tone: "mid", crease: "none" }, 18),
    ]),
  );
  out.push(cyl(0, 0, 9, 82, 14, { tone: "mid" }, 32), L(k.sideArc(0, 0, 9, 88, P, 18), { tone: "faint" }));
  out.push(slab({ x: -10, y: -54, w: 20, d: 58, r: 3 }, 96, 12, { tone: "mid" }, 4, 0.8));
  out.push(screws([[-5, -48], [5, -48], [-5, -4], [5, -4]], 108, 1.1));
  out.push(slab({ x: 10, y: -32, w: 26, d: 4, r: 1 }, 100, 4, { tone: "mid" }, 3, 0.4));
  out.push(cyl(40, -30, 4, 98, 8, { tone: "mid" }, 26), D([at([40, -30, 106])], { size: 0.5, tone: "hi" }));
  return svgOf(P, W, H, "A stamp press printing a mark onto a card", out);
}

/* Process: one rail through four stations. A shuttle carries the brief from station to station; each one adds
   what that step produces, and its head lowers while the shuttle is under it. */
const STATIONS = [-195, -65, 65, 195];
function processRail() {
  const W = 1120;
  const H = 300;
  const PLATE = { x: -262, y: -46, w: 524, d: 92, r: 8 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-258, -10, 80], [258, 8, 80]], W, H, { pad: 8, azimuth: 74, elevation: 26 });
  const { at, L, D, slab, cyl, top, outline, screws, text, base } = kitFor(P);
  const out = [base(PLATE, { label: "", ruler: false })];

  const t = k.topTicks(-250, 250, 5, 8, 38, 0, [1.6, 3.2], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  STATIONS.forEach((X, i) => {
    const plate = { x: X - 14, y: 22, w: 28, d: 10, r: 1 };
    out.push(slab(plate, 0, 0.6, { tone: "lo" }, 3, 0.2), text(X - 4, 29, 0.6, `0${i + 1}`, { size: 4.6, tone: "mid" }));
    out.push(D([at([X - 11, 27, 0.6]), at([X + 11, 27, 0.6])], { size: 0.45 }));
  });
  for (const y of [-14, 8]) {
    out.push(slab({ x: -244, y, w: 488, d: 4, r: 1 }, 0, 3, { tone: "mid" }, 3, 0.4));
    out.push(D([-236, -130, 0, 130, 236].map((x) => at([x, y + 2, 3])), { size: 0.4 }));
  }
  for (const x of [-250, 244]) out.push(slab({ x, y: -18, w: 6, d: 32, r: 1 }, 0, 8, { tone: "mid" }, 3, 0.5));
  out.push(slab({ x: -258, y: -6, w: 10, d: 10, r: 1.5 }, 0, 72, { tone: "mid" }, 4, 0.6), screws([[-256, -4], [-250, 2]], 0, 1));

  // shuttle with the brief; each station adds a layer to it
  const X0 = STATIONS[0];
  const sheet = { x: X0 - 16, y: -13, w: 32, d: 24, r: 1 };
  const layers = [
    [D([[-10, -8], [-10, -3], [-10, 2]].map(([x, y]) => at([X0 + x, y, 11.2])), { size: 0.6, tone: "hi" }), top([[X0 - 7, -8], [X0 + 8, -8]], 11.2, { tone: "mid" }), top([[X0 - 7, -3], [X0 + 4, -3]], 11.2, { tone: "mid" }), top([[X0 - 7, 2], [X0 + 10, 2]], 11.2, { tone: "lo" })],
    [outline({ x: X0 - 13, y: -10, w: 26, d: 6, r: 0.6 }, 11.2, { tone: "mid" }, 2), outline({ x: X0 - 13, y: -2, w: 12, d: 10, r: 0.6 }, 11.2, { tone: "mid" }, 2), outline({ x: X0 + 1, y: -2, w: 12, d: 10, r: 0.6 }, 11.2, { tone: "mid" }, 2)],
    [slab({ x: X0 - 13, y: -10, w: 26, d: 6, r: 0.6 }, 11.2, 0.6, { tone: "hi", crease: "none" }, 2, 0), slab({ x: X0 - 13, y: -2, w: 12, d: 10, r: 0.6 }, 11.2, 0.6, { tone: "mid", crease: "none" }, 2, 0), slab({ x: X0 + 1, y: -2, w: 12, d: 10, r: 0.6 }, 11.2, 0.6, { tone: "mid", crease: "none" }, 2, 0)],
    [L(k.ring(X0 + 11, 7, 2.6, 11.8, P, 20), { tone: "hi" }), top([[X0 + 9.8, 7], [X0 + 10.8, 8.2], [X0 + 12.6, 5.8]], 11.8, { tone: "hi" })],
  ];
  out.push(
    part("shuttle", [
      slab({ x: X0 - 22, y: -18, w: 44, d: 34, r: 3 }, 3, 7, { tone: "mid" }, 4, 0.6),
      D(k.corners({ x: X0 - 22, y: -18, w: 44, d: 34 }, 3).map(([x, y]) => at([x, y, 10])), { size: 0.45 }),
      slab(sheet, 10, 1.2, { tone: "hi", lit: true }, 3, 0.3),
      ...layers.map((layer, i) => part(`layer${i}`, layer, { o: i === 0 ? 1 : 0 })),
    ]),
  );

  // the four heads: lens, square, print head, seal
  const tools = [
    (X) => [cyl(X, -1, 13, 34, 2.4, { tone: "mid" }, 40), L(k.ring(X, -1, 10.5, 36.4, P, 36), { tone: "hi" }), top([[X - 6, -6], [X - 2, -8]], 36.4, { tone: "mid" }), cyl(X, -1, 2.2, 36.4, 2, { tone: "mid" }, 18), cyl(X, -1, 1.3, 38.4, 28, { tone: "mid", crease: "none" }, 14)],
    (X) => {
      const ticks = k.topTicks(X - 14, X + 16, 2, 5, -13, 36.4, [1, 2], P);
      return [slab({ x: X - 18, y: -9, w: 4, d: 20, r: 0.6 }, 34, 2.4, { tone: "mid" }, 2, 0.3), slab({ x: X - 18, y: -13, w: 36, d: 4, r: 0.6 }, 34, 2.4, { tone: "mid" }, 2, 0.3), L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }), cyl(X, -11, 1.3, 36.4, 30, { tone: "mid", crease: "none" }, 14)];
    },
    (X) => [slab({ x: X - 8, y: -9, w: 16, d: 16, r: 1 }, 34, 2, { tone: "lo" }, 3, 0.2), slab({ x: X - 10, y: -11, w: 20, d: 20, r: 2 }, 36, 14, { tone: "mid" }, 4, 0.6), D(k.dotGrid(X - 6, -7, 4, 4, 4, 50, P), { size: 0.4, tone: "mid" }), cyl(X, -1, 1.3, 50, 16, { tone: "mid", crease: "none" }, 14)],
    (X) => [cyl(X, -1, 9, 34, 6, { tone: "mid" }, 36), L(k.sideArc(X, -1, 9, 37, P, 20), { tone: "faint" }), cyl(X, -1, 4, 40, 3, { tone: "mid" }, 24), cyl(X, -1, 1.6, 43, 23, { tone: "mid", crease: "none" }, 14)],
  ];
  STATIONS.forEach((X, i) => out.push(part(`tool${i}`, tools[i](X))));
  for (const X of STATIONS) {
    out.push(slab({ x: X - 9, y: -10, w: 18, d: 18, r: 2 }, 60, 12, { tone: "mid" }, 4, 0.6));
    out.push(D([at([X - 7, 6, 72]), at([X + 7, 6, 72])], { size: 0.45 }));
  }
  out.push(slab({ x: -258, y: -6, w: 516, d: 10, r: 1.5 }, 72, 8, { tone: "mid" }, 3, 0.6));
  out.push(L(k.lineOnTop([-252, -3], [252, -3], 80, P) + k.lineOnTop([-252, 1], [252, 1], 80, P), { tone: "faint" }));
  out.push(slab({ x: 248, y: -6, w: 10, d: 10, r: 1.5 }, 0, 72, { tone: "mid" }, 4, 0.6), screws([[250, -4], [256, 2]], 0, 1));
  const stops = STATIONS.map((X) => r2(at([X, -1, 0])[0] / W)).join(" ");
  return svgOf(P, W, H, "A shuttle carrying a brief along a rail through four stations: lens, square, print head and seal", out).replace("<svg", `<svg data-stations="${stops}"`);
}

/* Fig, dashboards: an oscilloscope console. The trace scrolls across the screen, the bar meter breathes and the
   status lamps blink: dense data that still reads at a glance. */
function dashboard() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -92, y: -62, w: 184, d: 124, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-74, -48, 32]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, top, outline, base } = kitFor(P);
  const out = [base(PLATE, { label: "DB-03" })];
  const BODY = { x: -76, y: -48, w: 152, d: 90, r: 6 };
  out.push(slab(BODY, 0, 14, { tone: "mid" }, 6, 0.8), outline(k.insetPlan(BODY, 3), 14, { tone: "faint" }, 6));
  out.push(slab({ x: -68, y: -40, w: 90, d: 58, r: 3 }, 14, 1.4, { tone: "lo" }, 4, 0.3));
  const SCREEN = { x: -64, y: -36, w: 82, d: 50, r: 2 };
  const Z = 15.4;
  const grid = [];
  for (let x = -56; x <= 12; x += 8) grid.push(k.lineOnTop([x, -36], [x, 14], Z, P));
  for (let y = -28; y <= 6; y += 8) grid.push(k.lineOnTop([-64, y], [18, y], Z, P));
  out.push(L(grid.join(""), { tone: "faint" }), top([[-64, -11], [18, -11]], Z, { tone: "lo" }));
  const glass = k.planOutline(SCREEN, Z, P, 3);
  out.push(`<clipPath id="fig-dash-screen"><path d="${glass}"/></clipPath>`);
  const wave = (amp, freq) => {
    const pts = [];
    for (let x = -64 - 38; x <= 18; x += 1.2) pts.push([x, -11 + amp * Math.sin(((x + 64) / 38) * Math.PI * 2 * freq) * (0.75 + 0.25 * Math.cos(((x + 64) / 38) * Math.PI * 2))]);
    return pts;
  };
  out.push(`<g clip-path="url(#fig-dash-screen)">${part("trace", [top(wave(11, 1), Z, { tone: "lit" }), top(wave(5, 2), Z, { tone: "mid", dashed: true })], { drive: true })}</g>`);
  out.push(L(glass, { tone: "mid" }));
  for (const [x, y] of [[36, -30], [56, -30], [36, -12]]) {
    const t = k.radialTicks(x, y, 7.5, 12, 3, 14, [1, 1.8], P);
    out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
    out.push(cyl(x, y, 5, 14, 4, { tone: "mid" }, 26), L(k.knurl(x, y, 5, 14, 18, 22, P), { tone: "lo" }), top([[x, y], [x + 3.4, y - 3.4]], 18, { tone: "hi" }));
  }
  out.push(slab({ x: 50, y: -16, w: 16, d: 3, r: 1 }, 14, 0.4, { tone: "lo", crease: "none" }, 2, 0), slab({ x: 55, y: -17, w: 3, d: 5, r: 1 }, 14.4, 2.4, { tone: "mid" }, 2, 0.2));
  [10, 16, 8, 13, 6].forEach((h, i) => {
    const bx = 30 + i * 7;
    out.push(part(`bar${i}`, slab({ x: bx, y: 4, w: 4, d: 6, r: 0.6 }, 14, h, { tone: i === 1 ? "hi" : "mid" }, 2, 0.3), { anchor: at([bx + 2, 7, 14]) }));
  });
  out.push(D([0, 1, 2, 3, 4, 5].map((i) => at([30 + i * 6, 28, 14])), { size: 0.9, tone: "hi", pulse: true }));
  out.push(top([[-62, 30], [-20, 30]], 14, { tone: "mid" }), top([[-62, 34], [-36, 34]], 14, { tone: "lo" }));
  return svgOf(P, W, H, "An oscilloscope console with a scrolling trace and a bar meter", out);
}

/* Fig, logo design: a pen plotter drawing a mark. The bridge rides the rails in y, the carriage rides the bridge in x,
   and the ink follows the pen. */
const LOGO_R = 22;
function logo() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -92, y: -66, w: 184, d: 132, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-62, -60, 30], [62, 60, 30]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, top, screws, base } = kitFor(P);
  const out = [base(PLATE, { label: "LG-06" })];
  for (const x of [-62, 54]) {
    out.push(slab({ x, y: -60, w: 8, d: 120, r: 1.5 }, 0, 6, { tone: "mid" }, 3, 0.5));
    out.push(top([[x + 4, -56], [x + 4, 56]], 6, { tone: "faint" }), D([at([x + 4, -57, 6]), at([x + 4, 57, 6])], { size: 0.45 }));
  }
  const PAPER = { x: -40, y: -40, w: 80, d: 80, r: 1 };
  out.push(slab(PAPER, 0, 0.6, { tone: "hi", crease: "none" }, 2, 0));
  for (const [x, y] of k.corners(PAPER, 0)) out.push(slab({ x: x - 3, y: y - 3, w: 6, d: 6, r: 1 }, 0.6, 1, { tone: "mid" }, 2, 0.2));
  const tk = k.topTicks(-36, 36, 4, 5, 36, 0.6, [1, 2], P);
  out.push(L(tk.minor, { tone: "faint" }), L(tk.major, { tone: "lo" }));
  out.push(L(k.ring(0, 0, LOGO_R, 0.6, P, 48), { tone: "faint", dashed: true }));
  const circle = Array.from({ length: 49 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    return [LOGO_R * Math.cos(a), LOGO_R * Math.sin(a), 0.62];
  });
  out.push(part("ink", ink(P, circle, "lit", 1.6)));
  const X0 = LOGO_R;
  const carriage = [
    part("pen", [cyl(X0, 0, 0.7, 3.4, 1.2, { tone: "hi" }, 14), cyl(X0, 0, 1.7, 4.6, 12, { tone: "mid", crease: "none" }, 18), cyl(X0, 0, 2.2, 9, 2, { tone: "mid" }, 18)]),
    slab({ x: X0 - 8, y: -8, w: 16, d: 16, r: 2 }, 15, 12, { tone: "mid" }, 4, 0.6),
    D([at([X0 - 5, 5, 27]), at([X0 + 5, 5, 27])], { size: 0.45 }),
  ];
  out.push(
    part("py", [
      slab({ x: -61, y: -7, w: 10, d: 14, r: 1.5 }, 6, 12, { tone: "mid" }, 3, 0.5),
      slab({ x: -62, y: -4, w: 124, d: 8, r: 1 }, 18, 5, { tone: "mid" }, 3, 0.5),
      top([[-58, 0], [58, 0]], 23, { tone: "faint" }),
      part("px", carriage),
      slab({ x: 53, y: -7, w: 10, d: 14, r: 1.5 }, 6, 12, { tone: "mid" }, 3, 0.5),
      screws([[58, -3]], 18, 1),
    ]),
  );
  out.push(cyl(-72, 48, 6, 0, 10, { tone: "mid" }, 26), L(k.knurl(-72, 48, 6, 0, 10, 24, P), { tone: "lo" }));
  return svgOf(P, W, H, "A pen plotter drawing a circular mark", out);
}

/* Fig, illustration: a brush painting hills and a sun on an easel, from a palette of paints. */
const HILLS = [[-40, 30], [-30, 38], [-18, 44], [-6, 41], [6, 35], [18, 42], [30, 49], [40, 44]];
const SUN = Array.from({ length: 13 }, (_, i) => [24 + 8 * Math.cos((i / 12) * Math.PI * 2), 66 + 8 * Math.sin((i / 12) * Math.PI * 2)]);
const BOARD_Y = -6;
function illustration() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -90, y: -62, w: 180, d: 124, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-50, -10, 88], [52, -6, 88]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, base } = kitFor(P);
  const out = [base(PLATE, { label: "IL-07" })];
  out.push(slab({ x: -3, y: -46, w: 5, d: 5, r: 1 }, 0, 80, { tone: "mid" }, 2, 0.3));
  out.push(slab({ x: -52, y: -14, w: 104, d: 10, r: 1.5 }, 10, 4, { tone: "mid" }, 3, 0.4));
  out.push(slab({ x: -50, y: -10, w: 100, d: 4, r: 1 }, 14, 72, { tone: "mid" }, 3, 0.5));
  const face = (x, z) => [x, BOARD_Y + 0.05, z];
  out.push(L(k.pathOf([face(-44, 20), face(44, 20), face(44, 80), face(-44, 80)].map(at), true), { tone: "lo" }));
  out.push(L(k.segment(face(-44, 28), face(44, 28), P), { tone: "faint" }));
  out.push(part("hills", ink(P, HILLS.map(([x, z]) => face(x, z)), "lit", 1.6)));
  out.push(part("sun", ink(P, SUN.map(([x, z]) => face(x, z)), "hi", 1.3)));
  for (const x of [-55, 50]) out.push(slab({ x, y: -6, w: 5, d: 5, r: 1 }, 0, 92, { tone: "mid" }, 2, 0.3));
  out.push(cyl(-66, 30, 6, 0, 16, { tone: "mid" }, 26), L(k.sideArc(-66, 30, 6, 12, P, 16), { tone: "faint" }));
  out.push(L([[-68, 28], [-64, 31], [-66, 33]].map(([x, y], i) => k.segment([x, y, 16], [x + (i - 1) * 3, y + 2, 34], P)).join(""), { tone: "mid" }));
  const PALETTE = { x: 46, y: 16, w: 34, d: 26, r: 9 };
  out.push(slab(PALETTE, 0, 2, { tone: "mid" }, 8, 0.4));
  [[54, 22, "hi"], [64, 22, "mid"], [72, 30, "lo"], [56, 34, "mid"]].forEach(([x, y, tone], i) => out.push(cyl(x, y, 3, 2, 1, { tone, lit: i === 0 }, 18)));
  const [tx, tz] = HILLS[0];
  const tip = [tx, BOARD_Y + 1, tz];
  const handle = [tx + 8, BOARD_Y + 12, tz + 16];
  const brush = [
    L(k.segment(tip, [tx + 1.6, BOARD_Y + 2.4, tz + 3], P), { tone: "hi" }),
    L(k.segment([tx + 1.6, BOARD_Y + 2.4, tz + 3], [tx + 3, BOARD_Y + 4.5, tz + 6], P), { tone: "mid" }),
    `<path class="iso-line" data-tone="mid" style="stroke-width:2.4" d="${k.pathOf([at([tx + 3, BOARD_Y + 4.5, tz + 6]), at(handle)])}"/>`,
    D([at(tip)], { size: 0.9, tone: "hi" }),
  ];
  out.push(part("brush", brush));
  return svgOf(P, W, H, "A brush painting hills and a sun on an easel", out);
}

/* Fig, animation: a camera on a motion slider, easing between three keyframes marked on the rail. */
function animation() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -96, y: -56, w: 192, d: 112, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-86, -12, 42], [86, 14, 42]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, top, outline, screws, base } = kitFor(P);
  const out = [base(PLATE, { label: "AN-08" })];
  for (const x of [-82, 82]) out.push(cyl(x, 0, 7, 0, 1.6, { tone: "lo" }, 26), cyl(x, 0, 2.6, 1.6, 12.4, { tone: "mid", crease: "none" }, 18));
  out.push(slab({ x: -88, y: -12, w: 10, d: 24, r: 1.5 }, 14, 12, { tone: "mid" }, 3, 0.5));
  out.push(slab({ x: -80, y: -8, w: 160, d: 3, r: 1 }, 20, 3, { tone: "mid" }, 2, 0.3));
  out.push(slab({ x: -80, y: 5, w: 160, d: 3, r: 1 }, 20, 3, { tone: "mid" }, 2, 0.3));
  const tk = k.topTicks(-76, 76, 4, 5, -9.5, 20, [-1.2, -2.2], P);
  out.push(L(tk.minor, { tone: "lo" }), L(tk.major, { tone: "mid" }));
  for (const [i, x] of [-50, 0, 50].entries()) {
    out.push(outline({ x: x - 12, y: -12, w: 24, d: 24, r: 2 }, 23, { tone: "lo", dashed: true }, 3));
    out.push(D([at([x, 9.5, 23])], { size: 1, tone: i === 1 ? "hi" : "mid" }));
  }
  const X = -50;
  out.push(
    part("cam", [
      slab({ x: X - 12, y: -12, w: 24, d: 24, r: 2 }, 23, 4, { tone: "mid" }, 4, 0.5),
      D(k.corners({ x: X - 12, y: -12, w: 24, d: 24 }, 2.5).map(([x, y]) => at([x, y, 27])), { size: 0.4 }),
      slab({ x: X - 4, y: 2, w: 8, d: 10, r: 1.5 }, 29, 8, { tone: "mid" }, 3, 0.4),
      slab({ x: X - 8, y: -8, w: 16, d: 12, r: 2 }, 27, 12, { tone: "hi", lit: true }, 4, 0.6),
      slab({ x: X - 3, y: -6, w: 7, d: 5, r: 1 }, 39, 3, { tone: "mid" }, 2, 0.3),
      L(k.sideSeam({ x: X - 4, y: 2, w: 8, d: 10, r: 1.5 }, 33, P, 3), { tone: "lo" }),
      D([at([X + 6, -6, 39])], { size: 0.8, tone: "hi", pulse: true }),
    ]),
  );
  out.push(slab({ x: 78, y: -12, w: 10, d: 24, r: 1.5 }, 14, 12, { tone: "mid" }, 3, 0.5), screws([[83, -8], [83, 8]], 26, 1));
  const PLAQUE = { x: -36, y: 26, w: 72, d: 20, r: 2 };
  out.push(slab(PLAQUE, 0, 1, { tone: "lo" }, 3, 0.2));
  const curve = Array.from({ length: 25 }, (_, i) => {
    const t = i / 24;
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    return [-30 + t * 60, 42 - e * 12];
  });
  out.push(top(curve, 1, { tone: "hi" }), D([at([-30, 42, 1]), at([30, 30, 1])], { size: 0.8, tone: "hi" }), top([[-30, 43.5], [30, 43.5]], 1, { tone: "faint" }));
  return svgOf(P, W, H, "A camera easing along a motion slider between three keyframes", out);
}

/* Fig, pitch decks: a slide projector throwing a chart onto a screen; each slide grows the bars. */
function deck() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -92, y: -62, w: 184, d: 124, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [-62, -48, 84], [36, -44, 84]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, base } = kitFor(P);
  const out = [base(PLATE, { label: "PD-09" })];
  out.push(slab({ x: -34, y: -54, w: 44, d: 12, r: 2 }, 0, 3, { tone: "mid" }, 3, 0.4), cyl(-12, -48, 2, 3, 17, { tone: "mid", crease: "none" }, 16));
  out.push(slab({ x: -62, y: -50, w: 100, d: 4, r: 1 }, 20, 62, { tone: "mid" }, 3, 0.5));
  const FY = -46;
  const face = (x, z) => [x, FY + 0.05, z];
  out.push(L(k.pathOf([face(-58, 24), face(34, 24), face(34, 78), face(-58, 78)].map(at), true), { tone: "lo" }));
  out.push(k.faceTextSvg(k.sideMatrix([-54, FY + 0.05], 71, P, "left"), "+38%", { size: 7, tone: "hi" }));
  out.push(L(k.segment(face(-54, 64), face(-30, 64), P) + k.segment(face(-54, 30), face(28, 30), P), { tone: "faint" }));
  [10, 16, 22, 30].forEach((h, i) => {
    const bx = -20 + i * 11;
    out.push(part(`bar${i}`, slab({ x: bx, y: FY, w: 7, d: 1.2, r: 0.3 }, 30, h, { tone: i === 3 ? "hi" : "mid", lit: i === 3 }, 2, 0.2), { anchor: at([bx + 3.5, FY + 0.6, 30]) }));
  });
  out.push(part("flash", `<path class="iso-fill" style="fill:var(--anatomy-lit-top)" d="${k.pathOf([face(-58, 24), face(34, 24), face(34, 78), face(-58, 78)].map(at), true)}"/>`, { o: 0 }));
  const lens = [41, 10, 28.5];
  out.push(L([[-58, 24], [34, 24], [34, 78], [-58, 78]].map(([x, z]) => k.segment(lens, face(x, z), P)).join(""), { tone: "faint", dashed: true }));
  for (const [x, y] of [[22, 12], [62, 12], [22, 44], [62, 44]]) out.push(cyl(x, y, 1.6, 0, 18, { tone: "mid", crease: "none" }, 14));
  out.push(slab({ x: 18, y: 8, w: 48, d: 40, r: 2 }, 18, 4, { tone: "mid" }, 3, 0.5));
  out.push(slab({ x: 37, y: 9, w: 9, d: 8, r: 1.5 }, 24, 9, { tone: "mid" }, 3, 0.4));
  out.push(slab({ x: 28, y: 15, w: 28, d: 24, r: 3 }, 22, 12, { tone: "mid" }, 4, 0.6));
  const rt = k.radialTicks(42, 27, 9, 18, 3, 37, [0.8, 1.6], P);
  out.push(cyl(42, 27, 9, 34, 3, { tone: "mid" }, 34), L(rt.minor, { tone: "lo" }), L(rt.major, { tone: "mid" }), cyl(42, 27, 2.4, 37, 2, { tone: "mid" }, 18));
  out.push(D([at([31, 36, 34])], { size: 0.8, tone: "hi", pulse: true }));
  return svgOf(P, W, H, "A slide projector showing a growing bar chart on a screen", out);
}

/* Fig, no-code: a conveyor carrying components through a publish gate. */
function nocode() {
  const W = 340;
  const H = 230;
  const PLATE = { x: -100, y: -56, w: 200, d: 112, r: 6 };
  const P = k.fitProjection([...k.boxCorners(PLATE, -12, 0), [28, -22, 44], [32, 22, 44]], W, H, { pad: 10 });
  const { at, L, D, slab, cyl, top, outline, base } = kitFor(P);
  const out = [base(PLATE, { label: "NC-10" })];
  for (const [x, y] of [[-80, -15], [72, -15], [-80, 12], [72, 12]]) out.push(slab({ x, y, w: 5, d: 3, r: 0.6 }, 0, 10, { tone: "mid" }, 2, 0.3));
  out.push(slab({ x: -86, y: -16, w: 172, d: 3, r: 1 }, 10, 6, { tone: "mid" }, 2, 0.4));
  out.push(slab({ x: 26, y: -24, w: 5, d: 5, r: 1 }, 0, 36, { tone: "mid" }, 2, 0.4));
  const BELT = { x: -84, y: -13, w: 168, d: 26, r: 0 };
  out.push(slab(BELT, 10, 3, { tone: "lo" }, 2, 0));
  out.push(`<clipPath id="fig-belt"><path d="${k.planOutline(BELT, 13, P, 1)}"/></clipPath>`);
  const slats = [];
  for (let x = -84 - 8; x <= 84; x += 8) slats.push(k.lineOnTop([x, -13], [x, 13], 13, P));
  out.push(`<g clip-path="url(#fig-belt)">${part("slats", L(slats.join(""), { tone: "faint" }), { drive: true })}</g>`);
  const tile = (i) => {
    const x = -78;
    return [
      slab({ x, y: -9, w: 18, d: 18, r: 1.5 }, 13, 2, { tone: "hi", lit: i === 0 }, 3, 0.3),
      outline({ x: x + 2, y: -7, w: 14, d: 5, r: 0.6 }, 15, { tone: "mid" }, 2),
      top([[x + 2, 2], [x + 14, 2]], 15, { tone: "lo" }),
      top([[x + 2, 5], [x + 10, 5]], 15, { tone: "lo" }),
    ];
  };
  for (const i of [0, 1, 2]) out.push(part(`tile${i}`, tile(i), { drive: true }));
  out.push(slab({ x: -86, y: 13, w: 172, d: 3, r: 1 }, 10, 6, { tone: "mid" }, 2, 0.4));
  out.push(slab({ x: 26, y: 19, w: 5, d: 5, r: 1 }, 0, 36, { tone: "mid" }, 2, 0.4));
  out.push(slab({ x: 25, y: -25, w: 7, d: 50, r: 1.5 }, 36, 5, { tone: "mid" }, 3, 0.5));
  out.push(L([-14, -6, 2, 10].map((y) => k.segment([28.5, y, 36], [28.5, y, 18], P)).join(""), { tone: "faint", dashed: true }));
  out.push(cyl(28.5, 0, 3, 41, 3, { tone: "mid" }, 20), D([at([28.5, 0, 44])], { size: 1.1, tone: "hi", pulse: true }));
  out.push(slab({ x: 70, y: 24, w: 22, d: 24, r: 2 }, 0, 12, { tone: "mid" }, 3, 0.5), outline({ x: 72, y: 26, w: 18, d: 20, r: 1 }, 12, { tone: "faint" }, 3));
  return svgOf(P, W, H, "A conveyor carrying components through a publish gate", out);
}

/* Footer: a small city at work. Cars run both ways on the avenue, a train crosses on the viaduct, the factory
   breathes and a crane lifts a beam onto a half-built block. */
function city() {
  const W = 1400;
  const PLATE = { x: -310, y: -96, w: 620, d: 196, r: 10 };
  const reach = [...k.boxCorners(PLATE, -12, 0), [214, 62, 132], [-296, -88, 70], [-252, -86, 100], [-222, -56, 100], [56, -88, 140], [86, -58, 140], [-128, -76, 104]];
  const camera = { azimuth: 70, elevation: 30 };
  // height follows the drawing, so the city fills the full width of the footer
  const flat = reach.map((q) => k.iso(q, { origin: [0, 0], scale: 1, ...camera }));
  const span = (i) => Math.max(...flat.map((q) => q[i])) - Math.min(...flat.map((q) => q[i]));
  const H = Math.round(((W - 12) * span(1)) / span(0)) + 12;
  console.log("city height", H);
  const P = k.fitProjection(reach, W, H, { pad: 6, ...camera });
  const { at, L, D, slab, cyl, top, outline, byDepth, base } = kitFor(P);
  const out = [base(PLATE, { label: "CT-11" })];

  const facade = (b, h, step = 8) => {
    const segs = [];
    for (let z = 8; z < h - 4; z += step) {
      for (let x = b.x + 4; x + 3 < b.x + b.w - 2; x += 6) segs.push(k.segment([x, b.y + b.d, z], [x + 3, b.y + b.d, z], P));
      for (let y = b.y + 4; y + 3 < b.y + b.d - 2; y += 6) segs.push(k.segment([b.x + b.w, y, z], [b.x + b.w, y + 3, z], P));
    }
    return L(segs.join(""), { tone: "lo" });
  };
  const tower = (b, h, extra = []) => [slab(b, 0, h, { tone: "mid" }, 3, 0.6), facade(b, h), outline(k.insetPlan(b, 2), h, { tone: "faint" }, 3), ...extra];

  // back row
  const back = [
    [{ x: -298, y: -88, w: 40, d: 34, r: 1 }, 62],
    [{ x: -252, y: -86, w: 30, d: 30, r: 1 }, 92],
    [{ x: -84, y: -88, w: 36, d: 34, r: 1 }, 104],
    [{ x: -40, y: -84, w: 28, d: 28, r: 1 }, 70],
    [{ x: -4, y: -88, w: 50, d: 36, r: 1 }, 54],
    [{ x: 56, y: -88, w: 30, d: 30, r: 1 }, 120],
    [{ x: 96, y: -86, w: 44, d: 34, r: 1 }, 62],
    [{ x: 150, y: -88, w: 36, d: 34, r: 1 }, 86],
    [{ x: 196, y: -86, w: 50, d: 36, r: 1 }, 44],
    [{ x: 256, y: -88, w: 40, d: 34, r: 1 }, 74],
  ];
  const items = back.map(([b, h]) => ({ at: [b.x + b.w / 2, b.y + b.d / 2], svg: tower(b, h, h > 100 ? [cyl(b.x + b.w / 2, b.y + b.d / 2, 1.2, h, 16, { tone: "mid", crease: "none" }, 12), D([at([b.x + b.w / 2, b.y + b.d / 2, h + 16])], { size: 1.1, tone: "hi", pulse: true })] : [slab({ x: b.x + 4, y: b.y + 4, w: 10, d: 8, r: 1 }, h, 4, { tone: "mid" }, 2, 0.3)]).join("") }));
  // factory with a sawtooth roof and two chimneys
  const HALL = { x: -212, y: -88, w: 104, d: 40, r: 1 };
  const factory = [slab(HALL, 0, 30, { tone: "mid" }, 3, 0.6), facade(HALL, 30, 10)];
  for (let i = 0; i < 4; i++) factory.push(slab({ x: HALL.x + 4 + i * 25, y: HALL.y + 4, w: 20, d: 32, r: 0.5 }, 30, 6, { tone: "mid" }, 2, 0.3));
  for (const [x, h] of [[-128, 84], [-116, 70]]) {
    factory.push(cyl(x, -76, 4.4, 30, h - 30, { tone: "mid", crease: "none" }, 22));
    factory.push(L([50, 64].filter((z) => z < h).map((z) => k.sideArc(x, -76, 4.4, z, P, 14)).join(""), { tone: "faint" }));
    factory.push(part(`smoke${x < -120 ? 0 : 1}`, L(k.ring(x, -76, 5, h + 6, P, 20), { tone: "lo" }), { o: 0.6, anchor: at([x, -76, h + 6]) }));
  }
  items.push({ at: [-160, -68], svg: factory.join("") });
  out.push(...byDepth(items.map((i) => [...i.at, i.svg])).map((i) => i[2]));

  // viaduct and train
  for (let X = -280; X <= 280; X += 70) out.push(slab({ x: X - 3, y: -38, w: 6, d: 8, r: 1 }, 0, 26, { tone: "mid" }, 2, 0.4));
  out.push(slab({ x: -306, y: -40, w: 612, d: 12, r: 1 }, 26, 4, { tone: "mid" }, 3, 0.5));
  out.push(top([[-304, -37], [304, -37]], 30, { tone: "lo" }), top([[-304, -31], [304, -31]], 30, { tone: "lo" }));
  const cars = [];
  [-60, -14, 32].forEach((x0, i) => {
    const b = { x: x0, y: -39, w: 44, d: 10, r: i === 2 ? 4 : 1.5 };
    cars.push(slab(b, 30.5, 10, { tone: i === 2 ? "hi" : "mid", lit: i === 2 }, 6, 0.5), slab(k.insetPlan(b, 1.5), 40.5, 1.4, { tone: "mid" }, 3, 0.2));
    const win = [];
    for (let x = x0 + 4; x < x0 + 40; x += 6) win.push(k.segment([x, -29, 37], [x + 3.5, -29, 37], P));
    cars.push(L(win.join(""), { tone: "lo" }));
  });
  out.push(part("train", cars, { drive: true }));

  // avenue
  out.push(slab({ x: -306, y: -22, w: 612, d: 6, r: 1 }, 0, 1.5, { tone: "mid" }, 2, 0.2));
  out.push(slab({ x: -306, y: -16, w: 612, d: 44, r: 0 }, 0, 0.6, { tone: "lo", crease: "none" }, 2, 0));
  out.push(L(k.lineOnTop([-300, 6], [300, 6], 0.6, P), { tone: "mid", dashed: true }));
  out.push(L([0, 1, 2, 3, 4, 5].map((i) => k.lineOnTop([118 + i * 4, -14], [118 + i * 4, 26], 0.6, P)).join(""), { tone: "faint" }));
  const car = (x, y, dir, i, long = false) => {
    const w = long ? 32 : 16;
    const b = { x, y, w, d: 9, r: 2 };
    const cab = long ? { x: x + 2, y: y + 1, w: w - 4, d: 7, r: 1.2 } : { x: x + (dir > 0 ? 3 : 5), y: y + 1, w: 8, d: 7, r: 1.5 };
    return [
      slab(b, 1, long ? 9 : 4.5, { tone: "mid", lit: i === 0 && !long }, 4, 0.5),
      long ? L([0, 1, 2, 3].map((j) => k.segment([x + 4 + j * 7, y + 9, 6], [x + 8 + j * 7, y + 9, 6], P)).join(""), { tone: "lo" }) : slab(cab, 5.5, 3, { tone: "hi" }, 3, 0.3),
      D([at([dir > 0 ? x + w : x, y + 2, 3]), at([dir > 0 ? x + w : x, y + 7, 3])], { size: 0.6, tone: "hi" }),
    ];
  };
  [0, 1, 2].forEach((i) => out.push(part(`east${i}`, car(-300, -12, 1, i), { drive: true })));
  [0, 1, 2].forEach((i) => out.push(part(`west${i}`, car(270, 13, -1, i, i === 1), { drive: true })));
  out.push(slab({ x: -306, y: 28, w: 612, d: 6, r: 1 }, 0, 1.5, { tone: "mid" }, 2, 0.2));

  // front row: shops, trees, lamps, a half-built block and the crane
  const front = [];
  const shop = (b, h) => [slab(b, 0, h, { tone: "mid" }, 3, 0.6), facade(b, h, 9), slab({ x: b.x, y: b.y + b.d, w: b.w, d: 4, r: 0.5 }, h * 0.45, 1, { tone: "mid" }, 2, 0.2)].join("");
  for (const [b, h] of [[{ x: -296, y: 44, w: 36, d: 28, r: 1 }, 26], [{ x: -250, y: 48, w: 28, d: 26, r: 1 }, 34], [{ x: -130, y: 44, w: 44, d: 30, r: 1 }, 22], [{ x: -6, y: 46, w: 34, d: 28, r: 1 }, 30], [{ x: 76, y: 44, w: 40, d: 30, r: 1 }, 24], [{ x: 268, y: 46, w: 30, d: 30, r: 1 }, 32]]) front.push({ at: [b.x + b.w / 2, b.y + b.d / 2], svg: shop(b, h) });
  const tree = (x, y) => [cyl(x, y, 1.4, 0, 6, { tone: "mid", crease: "none" }, 12), cyl(x, y, 6, 6, 8, { tone: "mid" }, 22), cyl(x, y, 4, 14, 5, { tone: "mid" }, 20), cyl(x, y, 2, 19, 2, { tone: "mid" }, 14)].join("");
  for (const [x, y] of [[-210, 54], [-196, 70], [-170, 58], [-60, 56], [-44, 72], [48, 60], [140, 56], [160, 74], [244, 80]]) front.push({ at: [x, y], svg: tree(x, y) });
  for (const x of [-280, -200, -120, -40, 40, 120, 200, 280]) front.push({ at: [x, 37], svg: [cyl(x, 37, 0.9, 0, 24, { tone: "mid", crease: "none" }, 10), slab({ x: x - 1.5, y: 33, w: 3, d: 6, r: 0.5 }, 24, 1.4, { tone: "mid" }, 2, 0.2), D([at([x, 33.5, 24])], { size: 0.8, tone: "hi" })].join("") });
  const SITE = { x: 180, y: 58, w: 52, d: 30, r: 0.5 };
  const site = [slab(SITE, 0, 1.4, { tone: "lo" }, 2, 0.2)];
  for (const z of [16, 32]) site.push(slab(SITE, z, 1.6, { tone: "mid" }, 2, 0.3));
  for (const [x, y] of k.corners(SITE, 2)) site.push(L(k.segment([x, y, 1.4], [x, y, 32], P), { tone: "mid" }));
  site.push(L(k.segment([SITE.x + 26, SITE.y + SITE.d - 2, 1.4], [SITE.x + 26, SITE.y + SITE.d - 2, 32], P), { tone: "mid" }));
  site.push(part("placed", slab({ x: 186, y: 58, w: 40, d: 4, r: 0.5 }, 33.6, 3, { tone: "hi", lit: true }, 2, 0.3), { o: 0 }));
  front.push({ at: [SITE.x + SITE.w / 2, SITE.y + SITE.d / 2], svg: site.join("") });
  const lattice = [];
  for (let z = 4; z < 118; z += 8) lattice.push(k.segment([150, 56 + 8, z], [158, 56 + 8, z + 8], P), k.segment([158, 56, z], [158, 64, z + 8], P));
  const crane = [
    slab({ x: 146, y: 52, w: 16, d: 16, r: 1 }, 0, 4, { tone: "mid" }, 2, 0.4),
    slab({ x: 150, y: 56, w: 8, d: 8, r: 0.5 }, 4, 114, { tone: "mid" }, 2, 0.3),
    L(lattice.join(""), { tone: "lo" }),
    slab({ x: 112, y: 57, w: 136, d: 6, r: 0.5 }, 118, 5, { tone: "mid" }, 2, 0.3),
    slab({ x: 116, y: 55, w: 14, d: 10, r: 1 }, 110, 8, { tone: "mid" }, 2, 0.4),
    slab({ x: 152, y: 54, w: 10, d: 12, r: 1 }, 123, 7, { tone: "hi" }, 2, 0.4),
    L(k.segment([154, 60, 130], [246, 60, 123], P) + k.segment([154, 60, 130], [116, 60, 123], P), { tone: "lo" }),
  ];
  const HOOK_X = 230;
  crane.push(
    part("trolley", [
      slab({ x: HOOK_X - 4, y: 56, w: 8, d: 8, r: 1 }, 114, 4, { tone: "mid" }, 2, 0.3),
      part("cable", L(k.segment([HOOK_X, 60, 114], [HOOK_X, 60, 70], P), { tone: "mid" }), { anchor: at([HOOK_X, 60, 114]) }),
      part("hook", [slab({ x: HOOK_X - 2.5, y: 57.5, w: 5, d: 5, r: 1 }, 66, 4, { tone: "mid" }, 2, 0.3), part("beam", slab({ x: HOOK_X - 20, y: 58, w: 40, d: 4, r: 0.5 }, 58, 3, { tone: "hi", lit: true }, 2, 0.3)), L(k.segment([HOOK_X, 60, 66], [HOOK_X - 16, 60, 61], P) + k.segment([HOOK_X, 60, 66], [HOOK_X + 16, 60, 61], P), { tone: "lo" })]),
    ]),
  );
  front.push({ at: [154, 60], svg: crane.join("") });
  out.push(...byDepth(front.map((i) => [...i.at, i.svg])).map((i) => i[2]));
  return svgOf(P, W, H, "A small city at work: cars on the avenue, a train on the viaduct, a factory and a crane", out);
}

const art = { product: product(), web: web(), mobile: mobile(), brand: brand(), dashboard: dashboard(), logo: logo(), illustration: illustration(), animation: animation(), deck: deck(), nocode: nocode(), process: processRail(), city: city() };
mkdirSync(join(ROOT, "public/figures"), { recursive: true });
for (const [name, svg] of Object.entries(art)) writeFileSync(join(ROOT, `public/figures/${name}.svg`), svg);
const css = `/* Generated by scripts/figures/build.mjs from the anatomy kit (ISO_CSS). */\n${k.ISO_CSS}\n[data-part]{transition:opacity .3s ease}\n`;
writeFileSync(join(ROOT, "src/app/iso.css"), css);
for (const [name, svg] of Object.entries(art)) console.log(name.padEnd(8), `${(svg.length / 1024).toFixed(1)} KB`, `${(svg.match(/<path|<circle/g) ?? []).length} paths`);
