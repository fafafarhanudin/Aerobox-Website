"use client";

import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type SVGProps } from "react";
import {
  ArrowUpRight,
  Brush01,
  Contrast01,
  Crop01,
  Figma,
  Grid01,
  Grid03,
  LayersThree01,
  Moon01,
  Palette,
  PlayCircle,
  Sliders02,
  Sunrise,
  Tag01,
  Type01,
  Wind01,
} from "@/components/aero-icons";
import { Eyebrow, Key } from "@/components/ui";
import { ASSETS_URL, assetCounts, brandReel, isoReel, wallIcons } from "@/data/collection";
import { WALL_STYLES, wallStyleSvgs } from "@/data/collection-styles";

const fmt = (n: number) => n.toLocaleString("en-US");
const total = assetCounts.icons + assetCounts.avatars + assetCounts.flags + assetCounts.gradients + assetCounts.isometric + assetCounts.logos;

/* Each card plays its four features in turn; the stage acts out whichever feature is lit. */
const FEAT_MS = 2600;
const STEP_MS = 1300;

type Feature = { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; text: string };
type CardData = {
  no: string;
  title: string;
  lede: string;
  features: Feature[];
  count: string;
  formats: string;
  href: string;
  stage: "wall" | "mesh" | "iso" | "reel";
};

const cards: CardData[] = [
  {
    no: "01",
    title: "Aero Icons",
    lede: `${fmt(assetCounts.icons)} icons that change style, colour and motion right on the page, then paste into Figma as one clean vector.`,
    features: [
      { icon: LayersThree01, label: "Five styles", text: "Aero, Duotone, Two-tone, Filled and Sharp." },
      { icon: Palette, label: "Two colours, your pick", text: "Line and fill, or two line colours." },
      { icon: PlayCircle, label: "Motion inside the file", text: "Six motions that stay in the copied SVG." },
      { icon: Figma, label: "Clean paste", text: "One named vector per icon, no masks." },
    ],
    count: `${fmt(assetCounts.icons)} icons · ${assetCounts.avatars} avatars · ${assetCounts.flags} flags`,
    formats: "SVG · JSX · FIG",
    href: `${ASSETS_URL}/#/icons`,
    stage: "wall",
  },
  {
    no: "02",
    title: "Grain Gradients",
    lede: `${assetCounts.gradients} mesh, linear, radial and conic gradients you can texture, tune and set in motion before you export.`,
    features: [
      { icon: Grid03, label: "Grain or dither", text: "Film grain or Bayer dither, up to 16×16." },
      { icon: Wind01, label: "Gradients that move", text: "Five motions, as CSS or a looping video." },
      { icon: Sliders02, label: "Tune the palette", text: "Hue, saturation, brightness and blur." },
      { icon: Crop01, label: "Any frame", text: "Five ratios, PNG up to 1920 px." },
    ],
    count: `${assetCounts.gradients} gradients`,
    formats: "CSS · Tailwind · PNG · Video",
    href: `${ASSETS_URL}/#/gradients`,
    stage: "mesh",
  },
  {
    no: "03",
    title: "Isometric",
    lede: `${assetCounts.isometric} scenes for SaaS, fintech, Web3, tech and marketing pages, all on one 30° grid so they sit together.`,
    features: [
      { icon: Palette, label: "Four palettes or your own", text: "Four palettes, or a ramp from any colour." },
      { icon: Sunrise, label: "Shadows you steer", text: "Soft or long, with angle, blur and opacity." },
      { icon: Grid01, label: "Scene backgrounds", text: "Plain, grid or glow behind every scene." },
      { icon: Brush01, label: "Line weight", text: "1, 1.5 or 2 px outlines to match your icons." },
    ],
    count: `${assetCounts.isometric} scenes`,
    formats: "SVG · FIG · PNG",
    href: `${ASSETS_URL}/#/isometric`,
    stage: "iso",
  },
  {
    no: "04",
    title: "Logos",
    lede: `${fmt(assetCounts.brands)} real brand logos and ${assetCounts.logos} placeholder templates for mockups, docs and decks.`,
    features: [
      { icon: Tag01, label: "Sorted by field", text: "AI, software, dev, design, payments and more." },
      { icon: Contrast01, label: "Five colour modes", text: "Original, grey, black, white or duotone." },
      { icon: Moon01, label: "Icon or wordmark", text: "The mark or full wordmark, light or dark." },
      { icon: Type01, label: "Placeholder templates", text: `${assetCounts.marks} marks and ${assetCounts.lockups} lockups for early layouts.` },
    ],
    count: `${fmt(assetCounts.brands)} brands · ${assetCounts.logos} templates`,
    formats: "SVG · PNG",
    href: `${ASSETS_URL}/#/logos`,
    stage: "reel",
  },
];

function Svg({ html, className, style }: { html: string; className?: string; style?: CSSProperties }) {
  return <span className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}
function Chip({ text }: { text: string }) {
  return (
    <span className="sc-chip sc-chip--name" key={text}>
      {text}
    </span>
  );
}

/* 01 · icon wall: the grid scrolls; the lit feature restyles, recolours or animates every tile */
const LIT = 9;
function WallStage({ feat, step }: { feat: number; step: number }) {
  const style = feat === 0 ? WALL_STYLES[step % WALL_STYLES.length] : feat === 1 ? (step % 2 ? "Duotone" : "Two-tone") : feat === 3 ? "Filled" : "Aero";
  const motion = ["Bounce", "Pop", "Float"][step % 3];
  const chip = feat === 0 ? style : feat === 1 ? (style === "Two-tone" ? "Two-tone · two line colours" : "Duotone · line + fill") : feat === 2 ? `Motion · ${motion}` : `${wallIcons[LIT].name}.svg · 1 vector`;
  const svgs = wallStyleSvgs[style];
  const grid = (copy: number) => (
    <span className="sc-wall__grid" aria-hidden={copy === 1 || undefined}>
      {[...svgs, ...svgs].map((svg, i) => (
        <Svg key={i} html={svg} className={`sc-wall__tile${i === LIT ? " is-lit" : ""}`} style={{ "--w": (i * 5) % 7 } as CSSProperties} />
      ))}
    </span>
  );
  return (
    <span className={`sc-wall${feat === 2 ? ` is-moving m-${motion.toLowerCase()}` : ""}${feat === 3 ? " is-named" : ""}`}>
      <span className="sc-wall__track">
        {grid(0)}
        {grid(1)}
      </span>
      <span className="sc-wall__fade sc-wall__fade--t" />
      <span className="sc-wall__fade sc-wall__fade--b" />
      <Chip text={chip} />
    </span>
  );
}

/* 02 · mesh gradient: dither, motion, tuning or a new frame ratio, depending on the lit feature */
const RATIOS = [["4:3", "1600×1200"], ["16:9", "1920×1080"], ["9:16", "1080×1920"], ["1:1", "1600×1600"]] as const;
function MeshStage({ feat, step }: { feat: number; step: number }) {
  const bayer = [2, 4, 8, 16][step % 4];
  const ratio = RATIOS[step % RATIOS.length];
  const hue = [0, 45, 120, -60][step % 4];
  const chip =
    feat === 0 ? (step % 2 ? `Dither · Bayer ${bayer}×${bayer}` : "Grain · 32%")
      : feat === 1 ? `${["Drift", "Orbit", "Breathe"][step % 3]} · loop`
        : feat === 2 ? `Hue ${hue > 0 ? "+" : ""}${hue}°`
          : feat === 3 ? `${ratio[0]} · ${ratio[1]}`
            : "Aurora · Mesh · Grain";
  const cls = ["sc-mesh", feat === 0 && step % 2 ? "is-dither" : "", feat === 1 ? "is-moving" : "", feat === 3 ? `is-ratio r-${ratio[0].replace(":", "x")}` : ""].filter(Boolean).join(" ");
  return (
    <span className="sc-meshbox">
      <span className={cls} style={feat === 2 ? ({ filter: `hue-rotate(${hue}deg)` } as CSSProperties) : undefined}>
        <span className="sc-mesh__blob b1" />
        <span className="sc-mesh__blob b2" />
        <span className="sc-mesh__blob b3" />
        <span className="sc-mesh__blob b4" />
        <span className="sc-mesh__grain" />
        <span className="sc-mesh__dither" />
        <span className="sc-mesh__sheen" />
      </span>
      <Chip text={chip} />
    </span>
  );
}

/* 03 · isometric: palette, shadow, background or line weight on the scene of the moment */
const PALETTES = [["Blue", "none"], ["Green", "hue-rotate(-95deg) saturate(.85)"], ["Violet", "hue-rotate(38deg)"], ["Mono", "grayscale(1) contrast(1.05)"]] as const;
function IsoStage({ feat, step }: { feat: number; step: number }) {
  const cur = step % isoReel.length;
  const pal = PALETTES[step % PALETTES.length];
  const bg = (["Plain", "Grid", "Glow"] as const)[step % 3];
  const chip =
    feat === 0 ? `Palette · ${pal[0]}`
      : feat === 1 ? (step % 2 ? "Long shadow" : "Soft shadow")
        : feat === 2 ? `Background · ${bg}`
          : feat === 3 ? `${["1", "1.5", "2"][step % 3]} px outline`
            : isoReel[cur].name;
  const cls = ["sc-iso", feat === 1 ? (step % 2 ? "sh-long" : "sh-soft") : "", feat === 2 ? `bg-${bg.toLowerCase()}` : "", feat === 3 ? `lw-${step % 3}` : ""].filter(Boolean).join(" ");
  return (
    <span className={cls} style={feat === 0 ? ({ "--iso-filter": pal[1] } as CSSProperties) : undefined}>
      <span className="sc-iso__glow" />
      <span className="sc-iso__long" />
      {isoReel.map((s, i) => (
        <Svg key={s.name} html={`<svg viewBox="0 0 240 200" width="100%" height="100%">${s.svg}</svg>`} className={`sc-iso__art${i === cur ? " is-on" : ""}`} />
      ))}
      <span className="sc-iso__shadow" />
      <Chip text={chip} />
    </span>
  );
}

/* 04 · logos: the reel keeps turning; colour mode, tile theme or category follows the lit feature */
const FIELDS = ["AI", "Software", "Dev", "Data", "Design", "Social", "Payments"];
const MODES = ["Original", "Grey", "Black", "White", "Duotone"];
function ReelStage({ feat, step }: { feat: number; step: number }) {
  const items = [...brandReel, ...brandReel, ...brandReel];
  const cur = brandReel.length + (step % brandReel.length);
  const mode = MODES[step % MODES.length];
  const chip =
    feat === 0 ? `Field · ${FIELDS[step % FIELDS.length]}`
      : feat === 1 ? `Colour · ${mode}`
        : feat === 2 ? (step % 2 ? "Dark tiles" : "Light tiles")
          : feat === 3 ? `${assetCounts.marks} marks · ${assetCounts.lockups} lockups`
            : brandReel[cur % brandReel.length].name;
  const cls = ["sc-reel", feat === 1 ? `tone-${mode.toLowerCase()}` : "", feat === 2 && step % 2 ? "is-dark" : ""].filter(Boolean).join(" ");
  return (
    <span className={cls}>
      <span className="sc-reel__track" style={{ "--cur": cur } as CSSProperties}>
        {items.map((m, i) => (
          <span key={i} className={`sc-reel__item${i === cur ? " is-on" : ""}`}>
            <span className="sc-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.src} alt="" width={34} height={34} loading="lazy" />
            </span>
            <span className="sc-reel__name">{m.name}</span>
          </span>
        ))}
      </span>
      <span className="sc-reel__fade sc-reel__fade--l" />
      <span className="sc-reel__fade sc-reel__fade--r" />
      <Chip text={chip} />
    </span>
  );
}

export function Collection() {
  // one state for card + feature, so advancing stays a pure update (StrictMode-safe)
  const [pos, setPos] = useState({ a: 0, f: 0 });
  const active = pos.a;
  const feat = pos.f;
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const hovering = useRef(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // features advance one by one; after the last one the next card takes over (paused while a card is hovered)
  useEffect(() => {
    if (!visible || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const next = setInterval(() => {
      if (hovering.current) return;
      setPos((p) => (p.f < cards[p.a].features.length - 1 ? { a: p.a, f: p.f + 1 } : { a: (p.a + 1) % cards.length, f: 0 }));
    }, FEAT_MS);
    const tick = setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => {
      clearInterval(next);
      clearInterval(tick);
    };
  }, [visible]);

  return (
    <section
      ref={ref}
      id="collection"
      className="showcase flex scroll-mt-16 flex-col gap-10 px-5 py-16 md:gap-12 md:px-8 md:py-20 lg:px-[clamp(48px,8.33vw,120px)] lg:pb-16 lg:pt-24"
      data-playing={visible || undefined}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col items-start gap-5">
          <Eyebrow index="07" label="Collection" count={`${fmt(total)} assets`} className="eyebrow--dark" />
          <h2 className="font-heading text-[36px] leading-[40px] tracking-[-1.08px] text-white md:text-[52px] md:leading-[56px] md:tracking-[-1.56px] lg:text-[64px] lg:leading-[68px] lg:tracking-[-1.92px]">
            Four libraries.
            <br />
            <span className="text-white/40">One quiet system.</span>
          </h2>
        </div>
        <div className="flex flex-col items-start gap-5 md:max-w-[400px] lg:max-w-[380px]">
          <p className="text-[15px] leading-6 tracking-[-0.15px] text-white/55">
            Icons, gradients, isometric scenes and logos, each with its own editor. Restyle, recolour and animate on
            the page, then take the file as SVG, PNG, CSS or a Figma-ready vector. Free for personal and commercial
            work.
          </p>
          <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-3">
            <Key
              href={ASSETS_URL}
              variant="secondary"
              className="max-sm:w-full"
              capClassName="h-11 gap-2.5 pl-4 pr-2.5 text-[15px] font-medium leading-5 tracking-[-0.15px]"
            >
              Browse all assets
              <span className="legend" aria-hidden="true">
                <ArrowUpRight width={12} height={12} strokeWidth={2} />
              </span>
            </Key>
            <span className="font-mono text-[12px] leading-4 text-white/35">v2.0 · updated weekly</span>
          </div>
        </div>
      </div>

      <div className="sc-grid">
        {cards.map((c, i) => {
          const on = i === active;
          const lit = on ? feat : -1;
          return (
            <a
              key={c.no}
              href={c.href}
              className={`sc-card${on ? " is-on" : ""}`}
              onMouseEnter={() => {
                hovering.current = true;
                if (!on) setPos({ a: i, f: 0 });
              }}
              onMouseLeave={() => {
                hovering.current = false;
              }}
              onFocus={() => {
                if (!on) setPos({ a: i, f: 0 });
              }}
            >
              <span className="sc-stage" aria-hidden="true">
                {c.stage === "wall" && <WallStage feat={on ? feat : 0} step={on ? step : 0} />}
                {c.stage === "mesh" && <MeshStage feat={on ? feat : -1} step={on ? step : 0} />}
                {c.stage === "iso" && <IsoStage feat={on ? feat : -1} step={on ? step : 0} />}
                {c.stage === "reel" && <ReelStage feat={on ? feat : -1} step={on ? step : 0} />}
                <span className="sc-dim" />
              </span>
              <span className="sc-meta">
                <span className="sc-head">
                  <span className="sc-no">{c.no}</span>
                  <span className="sc-title">{c.title}</span>
                  <span className="sc-desc">{c.lede}</span>
                </span>
                <span className="sc-feats">
                  {c.features.map((f, k) => {
                    const Ic = f.icon;
                    return (
                      <span
                        key={f.label}
                        className={`sc-feat${k === lit ? " is-on" : ""}`}
                        onMouseEnter={() => setPos({ a: i, f: k })}
                      >
                        <span className="sc-feat__ic">
                          <Ic width={16} height={16} strokeWidth={1.75} />
                        </span>
                        <span className="sc-feat__txt">
                          <b>{f.label}</b>
                          <span>{f.text}</span>
                        </span>
                      </span>
                    );
                  })}
                </span>
                <span className="sc-foot">
                  <span className="sc-mono">
                    <span>{c.count}</span>
                    <span className="dim">{c.formats}</span>
                  </span>
                  <span className="sc-link">
                    Open library <ArrowUpRight width={14} height={14} strokeWidth={2} />
                  </span>
                </span>
              </span>
            </a>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-6 font-mono text-[12px] leading-4 text-white/40">
        <span className="flex items-center">
          <span className="sc-led" />
          All libraries free · no sign-up · MIT-style licence
        </span>
        <a href={ASSETS_URL} className="transition-colors hover:text-white">
          aeroboxstudio.com/library →
        </a>
      </div>
    </section>
  );
}
