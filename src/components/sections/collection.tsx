"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight } from "@untitled-ui/icons-react";
import { Eyebrow, Key } from "@/components/ui";
import { ASSETS_URL, assetCounts, brandReel, isoReel, wallIcons } from "@/data/collection";

const fmt = (n: number) => n.toLocaleString("en-US");
const total = assetCounts.icons + assetCounts.avatars + assetCounts.flags + assetCounts.gradients + assetCounts.isometric + assetCounts.logos;

const CYCLE_MS = 4000;
const STEP_MS = 1400;

type CardData = {
  no: string;
  title: string;
  desc: string;
  count: string;
  formats: string;
  href: string;
  stage: "wall" | "mesh" | "iso" | "reel";
};

const cards: CardData[] = [
  {
    no: "01",
    title: "Aero Icons",
    desc: `${fmt(assetCounts.icons)} icons, 100 of them drawn in one continuous line, plus ${assetCounts.avatars} avatars and ${assetCounts.flags} flags.`,
    count: `${fmt(assetCounts.icons)} icons`,
    formats: "SVG · JSX · FIG",
    href: `${ASSETS_URL}/#/icons`,
    stage: "wall",
  },
  {
    no: "02",
    title: "Grain Gradients",
    desc: `${assetCounts.gradients} mesh, linear, radial and conic gradients with a fine grain.`,
    count: `${assetCounts.gradients} gradients`,
    formats: "CSS · Tailwind",
    href: `${ASSETS_URL}/#/gradients`,
    stage: "mesh",
  },
  {
    no: "03",
    title: "Isometric",
    desc: `${assetCounts.isometric} scenes for SaaS, fintech, Web3, tech and marketing pages.`,
    count: `${assetCounts.isometric} scenes`,
    formats: "SVG · FIG · PNG",
    href: `${ASSETS_URL}/#/isometric`,
    stage: "iso",
  },
  {
    no: "04",
    title: "Logos",
    desc: `${assetCounts.brands} real-world brand logos, plus ${assetCounts.logos} placeholder templates, like Logoipsum, for mockups and decks.`,
    count: `${assetCounts.brands} brands · ${assetCounts.logos} templates`,
    formats: "SVG · PNG",
    href: `${ASSETS_URL}/#/logos`,
    stage: "reel",
  },
];

function Svg({ html, className, style }: { html: string; className?: string; style?: CSSProperties }) {
  return <span className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* Icon wall: two stacked copies of the grid scroll upward forever; one tile is lit. */
function WallStage() {
  const tiles = wallIcons.slice(0, 30);
  const grid = (copy: number) => (
    <span className="sc-wall__grid" aria-hidden={copy === 1 || undefined}>
      {tiles.map((t, i) => (
        <Svg
          key={t.name}
          html={t.svg}
          className={`sc-wall__tile${i === 9 ? " is-lit" : ""}`}
          style={{ "--w": (i * 5) % 7 } as CSSProperties}
        />
      ))}
    </span>
  );
  return (
    <span className="sc-wall">
      <span className="sc-wall__track">
        {grid(0)}
        {grid(1)}
      </span>
      <span className="sc-wall__fade sc-wall__fade--t" />
      <span className="sc-wall__fade sc-wall__fade--b" />
    </span>
  );
}

function MeshStage() {
  return (
    <span className="sc-mesh">
      <span className="sc-mesh__blob b1" />
      <span className="sc-mesh__blob b2" />
      <span className="sc-mesh__blob b3" />
      <span className="sc-mesh__blob b4" />
      <span className="sc-mesh__grain" />
      <span className="sc-mesh__sheen" />
      <span className="sc-chip">Aurora · Mesh · Grain</span>
    </span>
  );
}

function IsoStage({ step }: { step: number }) {
  const cur = step % isoReel.length;
  return (
    <span className="sc-iso">
      <span className="sc-iso__glow" />
      {isoReel.map((s, i) => (
        <Svg
          key={s.name}
          html={`<svg viewBox="0 0 240 200" width="100%" height="100%">${s.svg}</svg>`}
          className={`sc-iso__art${i === cur ? " is-on" : ""}`}
        />
      ))}
      <span className="sc-iso__shadow" />
      <span className="sc-chip sc-chip--name" key={cur}>
        {isoReel[cur].name}
      </span>
    </span>
  );
}

function ReelStage({ step }: { step: number }) {
  // Three copies so the centred brand always has neighbours on both sides.
  const items = [...brandReel, ...brandReel, ...brandReel];
  const cur = brandReel.length + (step % brandReel.length);
  return (
    <span className="sc-reel">
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
    </span>
  );
}

export function Collection() {
  const [active, setActive] = useState(0);
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

  useEffect(() => {
    if (!visible || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cycle = setInterval(() => {
      if (!hovering.current) setActive((a) => (a + 1) % cards.length);
    }, CYCLE_MS);
    const tick = setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => {
      clearInterval(cycle);
      clearInterval(tick);
    };
  }, [visible, active]);

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
        <div className="flex flex-col items-start gap-5 md:max-w-[400px] lg:max-w-[360px]">
          <p className="text-[15px] leading-6 tracking-[-0.15px] text-white/55">
            Over 1,000 assets drawn in-house: icons, gradients, isometric scenes and logo marks. Every file
            ships as SVG, PNG, CSS, React and Figma, free for personal and commercial work.
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
          return (
            <a
              key={c.no}
              href={c.href}
              className={`sc-card${on ? " is-on" : ""}`}
              onMouseEnter={() => {
                hovering.current = true;
                setActive(i);
              }}
              onMouseLeave={() => {
                hovering.current = false;
              }}
              onFocus={() => setActive(i)}
            >
              <span className="sc-meta">
                <span className="sc-head">
                  <span className="sc-no">{c.no}</span>
                  <span className="sc-title">{c.title}</span>
                  <span className="sc-desc">{c.desc}</span>
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
              <span className="sc-stage" aria-hidden="true">
                {c.stage === "wall" && <WallStage />}
                {c.stage === "mesh" && <MeshStage />}
                {c.stage === "iso" && <IsoStage step={on ? step : 0} />}
                {c.stage === "reel" && <ReelStage step={on ? step : 0} />}
                <span className="sc-dim" />
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
