import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "@untitled-ui/icons-react";
import { Eyebrow, Key } from "@/components/ui";
import { Marquee } from "@/components/marquee";
import {
  ASSETS_URL,
  assetCounts,
  sampleAvatars,
  sampleFlags,
  sampleGradients,
  sampleIcons,
  sampleIso,
  sampleMarks,
} from "@/data/collection";

const total = Object.values(assetCounts).reduce((a, b) => a + b, 0);
const fmt = (n: number) => n.toLocaleString("en-US");

function Svg({ html, className, style }: { html: string; className?: string; style?: CSSProperties }) {
  return <span className={className} style={style} aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

function Card({
  href,
  title,
  formats,
  count,
  children,
  className = "",
}: {
  href: string;
  title: string;
  formats: string;
  count: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`lift group flex flex-col rounded-lg border border-line bg-white p-1.5 ${className}`}
    >
      <span className="coll-stage relative block flex-1 overflow-hidden rounded bg-subtle">
        {children}
        <span className="pointer-events-none absolute right-2 top-2 z-[2] flex items-center gap-1 rounded-full bg-ink/90 px-2.5 py-1 text-[12px] font-medium leading-4 tracking-[-0.12px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          Open library <ArrowUpRight width={12} height={12} strokeWidth={1.6} />
        </span>
      </span>
      <span className="flex items-center justify-between gap-3 px-2 pb-1 pt-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[13px] font-medium leading-5 tracking-[-0.13px] text-ink md:text-[14px] md:tracking-[-0.14px]">{title}</span>
          <span className="hidden shrink-0 text-[12px] leading-4 tracking-[-0.12px] text-ink-2 md:inline">{formats}</span>
        </span>
        <span className="shrink-0 font-mono text-[12px] leading-4 text-ink-3">{fmt(count)}</span>
      </span>
    </a>
  );
}

const iconRows = [sampleIcons.slice(0, 17), sampleIcons.slice(17)];

export function Collection() {
  return (
    <section
      id="collection"
      className="flex scroll-mt-4 flex-col gap-8 border-b border-line px-5 py-14 md:gap-10 md:px-8 md:py-[72px] lg:px-[clamp(48px,8.33vw,120px)] lg:py-20"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="02" label="Collection" count={`${fmt(total)} assets`} />
          <h2 className="font-heading text-[30px] leading-[36px] tracking-[-0.72px] text-ink md:text-[36px] md:leading-[44px] lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            Free assets,
            <br />
            drawn in-house
          </h2>
        </div>
        <div className="flex flex-col items-start gap-5 md:max-w-[360px] md:items-end lg:max-w-[456px]">
          <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2 md:text-right">
            Aerobox Assets is my free library of icons, gradients, isometric scenes, logo marks, avatars and flags.
            Copy them as SVG, PNG, CSS or React and ship.
          </p>
          <Key
            href={ASSETS_URL}
            variant="primary"
            className="w-full md:w-auto"
            capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]"
          >
            Browse Aerobox Assets
            <span className="legend" aria-hidden="true">
              <ArrowUpRight width={12} height={12} strokeWidth={1.6} />
            </span>
          </Key>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-3 lg:gap-4">
        <Card href={`${ASSETS_URL}/#/icons`} title="Icons" formats="SVG · React · Figma" count={assetCounts.icons}>
          <span className="flex h-full flex-col justify-center gap-2 md:gap-2.5">
            {iconRows.map((row, r) => (
              <Marquee
                key={r}
                label={r === 0 ? "Icon samples" : "More icon samples"}
                duration={row.length * 2.2}
                direction={r === 0 ? "left" : "right"}
                fade="w-10"
                className="w-full"
                pauseOnHover={false}
              >
                {row.map((icon) => (
                  <Svg key={icon.name} html={icon.svg} className="coll-icon" />
                ))}
              </Marquee>
            ))}
          </span>
        </Card>

        <Card href={`${ASSETS_URL}/#/gradients`} title="Gradients" formats="CSS · PNG" count={assetCounts.gradients}>
          {sampleGradients.map((g, i) => (
            <span
              key={g.name}
              className="coll-cycle absolute inset-0"
              style={{ background: g.css, "--i": i, "--n": sampleGradients.length } as CSSProperties}
            >
              <span className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-0.5 font-mono text-[10px] leading-4 text-ink backdrop-blur md:bottom-2.5 md:left-2.5 md:text-[11px]">
                {g.name}
              </span>
            </span>
          ))}
          <span className="coll-grain" aria-hidden="true" />
        </Card>

        <Card href={`${ASSETS_URL}/#/isometric`} title="Isometric" formats="SVG" count={assetCounts.isometric}>
          {sampleIso.map((s, i) => (
            <span
              key={s.name}
              className="coll-cycle coll-cycle--rise absolute inset-0 grid place-items-center"
              style={{ "--i": i, "--n": sampleIso.length } as CSSProperties}
            >
              <Svg html={`<svg viewBox="0 0 240 200" width="100%" height="100%">${s.svg}</svg>`} className="block h-[82%] w-[82%]" />
              <span className="absolute bottom-2 left-2.5 hidden font-mono text-[11px] leading-4 text-ink-2 md:block">{s.name}</span>
            </span>
          ))}
        </Card>

        <Card href={`${ASSETS_URL}/#/logos`} title="Logo templates" formats="SVG · PNG" count={assetCounts.logos}>
          <span className="flex h-full items-center">
            <Marquee label="Logo samples" duration={36} fade="w-12" className="w-full" pauseOnHover={false}>
              {sampleMarks.map((m) => (
                <span key={m.name} className="coll-mark">
                  <Svg html={m.svg.replace('width="40" height="40"', 'width="48" height="48"')} />
                  <span className="text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-2">{m.name}</span>
                </span>
              ))}
            </Marquee>
          </span>
        </Card>

        <Card href={`${ASSETS_URL}/#/icons`} title="Avatars" formats="SVG · JPG" count={assetCounts.avatars}>
          <span className="grid h-full grid-cols-3 place-items-center gap-1 p-3 max-md:[&>*:nth-child(n+10)]:hidden md:grid-cols-6 md:gap-1.5 md:p-4 lg:grid-cols-4">
            {sampleAvatars.map((a, i) => (
              <Svg
                key={a.name}
                html={`<svg viewBox="0 0 64 64" width="100%" height="100%">${a.svg}</svg>`}
                className="coll-avatar"
                style={{ "--i": i } as CSSProperties}
              />
            ))}
          </span>
        </Card>

        <Card href={`${ASSETS_URL}/#/icons`} title="Flags" formats="SVG · 4 shapes" count={assetCounts.flags}>
          <span className="flex h-full flex-col justify-center gap-2 md:gap-3">
            {[sampleFlags.slice(0, 8), sampleFlags.slice(8)].map((row, r) => (
              <Marquee
                key={r}
                label={r === 0 ? "Flag samples" : "More flag samples"}
                duration={22}
                direction={r === 0 ? "right" : "left"}
                fade="w-10"
                className="w-full"
                pauseOnHover={false}
              >
                {row.map((f) => (
                  <Svg
                    key={f.name}
                    html={`<svg viewBox="${f.vb}" width="42" height="30">${f.html}</svg>`}
                    className="coll-flag"
                  />
                ))}
              </Marquee>
            ))}
          </span>
        </Card>
      </div>
    </section>
  );
}
