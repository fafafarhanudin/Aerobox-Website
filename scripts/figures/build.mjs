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
function part(name, inner, { o, anchor } = {}) {
  const style = o === undefined ? "" : ` style="opacity:${o}"`;
  const pin = anchor ? ` data-anchor="${r2(anchor[0])} ${r2(anchor[1])}"` : "";
  return `<g data-part="${name}"${style}${pin}>${Array.isArray(inner) ? inner.join("") : inner}</g>`;
}
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

const art = { product: product(), web: web(), mobile: mobile(), brand: brand(), process: processRail() };
mkdirSync(join(ROOT, "public/figures"), { recursive: true });
for (const [name, svg] of Object.entries(art)) writeFileSync(join(ROOT, `public/figures/${name}.svg`), svg);
const css = `/* Generated by scripts/figures/build.mjs from the anatomy kit (ISO_CSS). */\n${k.ISO_CSS}\n[data-part]{transition:opacity .3s ease}\n`;
writeFileSync(join(ROOT, "src/app/iso.css"), css);
for (const [name, svg] of Object.entries(art)) console.log(name.padEnd(8), `${(svg.length / 1024).toFixed(1)} KB`, `${(svg.match(/<path|<circle/g) ?? []).length} paths`);
