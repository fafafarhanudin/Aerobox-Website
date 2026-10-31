"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Eyebrow, Key } from "@/components/ui";
import { TransitionLink } from "@/components/view-transition";
import { screens } from "@/data/work";

/* Every portfolio piece on its own card, in a masonry of three columns: each image keeps its own proportions,
   so nothing is cropped and no card carries empty space. A card opens the project it belongs to. */

const FILTERS = ["Case studies", "Dashboards", "Web apps", "Mobile apps", "Landing pages"] as const;
type Filter = (typeof FILTERS)[number];
type Screen = (typeof screens)[number];

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");
const inFilter = (s: Screen, f: Filter | null) => !f || (f === "Case studies" ? s.isCase : s.category === f);

function ScreenCard({ s, priority }: { s: Screen; priority: boolean }) {
  const [name, ...rest] = s.title.split(" · ");
  return (
    <TransitionLink href={`/work/${s.slug}`} className="lift group mb-4 flex break-inside-avoid flex-col rounded-lg border border-line bg-white p-1.5 md:mb-5" aria-label={`${s.title}, ${s.tag}`}>
      <span className="relative block overflow-hidden rounded bg-subtle" data-vt-name={`work-${s.slug}`}>
        <Image
          src={s.src}
          alt={`${s.title} — ${s.tag}`}
          width={s.w}
          height={s.h}
          sizes="(min-width: 1200px) 440px, (min-width: 744px) 46vw, 92vw"
          quality={85}
          priority={priority}
          className="block h-auto w-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.015] motion-reduce:transition-none"
        />
        <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-ink/90 px-2.5 py-1 text-[12px] font-medium leading-4 tracking-[-0.12px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
          View project ↗
        </span>
        {(s.isCase || s.isNew) && (
          <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 font-mono text-[10px] uppercase leading-4 tracking-[0.08em] text-ink shadow-[0_0_0_1px_rgba(12,14,20,.08)]">
            {s.isCase ? "Case study" : "New"}
          </span>
        )}
      </span>
      <span className="flex items-center justify-between gap-3 px-2 pb-1 pt-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink">{name}</span>
          <span className="truncate text-[12px] leading-4 tracking-[-0.12px] text-ink-2">{rest.length ? rest.join(" · ") : s.tag}</span>
        </span>
      </span>
    </TransitionLink>
  );
}

export function WorkIndex() {
  const [current, setCurrent] = useState<Filter | null>(null);

  // ?category=… deep links (and the old links that pointed at a category)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("category");
    const match = FILTERS.find((f) => slug(f) === q);
    if (match) setCurrent(match);
  }, []);

  const select = (f: Filter | null) => {
    setCurrent(f);
    window.history.replaceState(null, "", f ? `/work?category=${slug(f)}` : "/work");
  };

  const shown = screens.filter((s) => inFilter(s, current));
  const filterCap = "gap-2.5 px-3.5 py-2 text-[14px] font-medium leading-5 tracking-[-0.14px]";

  return (
    <>
      <header className="flex flex-col gap-8 px-5 py-12 md:gap-10 md:px-8 md:py-16 lg:gap-[58px] lg:px-12">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="01" label="Work" count={screens.length} />
          <h1 className="font-heading text-[44px] leading-[48px] tracking-[-0.88px] text-ink md:text-[56px] md:leading-[60px] md:tracking-[-1.12px] lg:text-[72px] lg:leading-[72px] lg:tracking-[-1.44px]">
            All work, <span className="text-ink-soft">up close.</span>
          </h1>
          <p className="max-w-[640px] text-[18px] leading-[26px] tracking-[-0.18px] text-ink-2">
            {screens.length} dashboards, web apps, mobile apps and landing pages for SaaS, AI, B2B and Web3 teams. Open any
            of them to see the whole project.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-2.5 gap-y-2 md:gap-y-2.5" role="toolbar" aria-label="Filter by category">
          <Key size="sm" variant={current === null ? "primary" : "secondary"} aria-pressed={current === null} onClick={() => select(null)} capClassName={filterCap}>
            All
            <span className={current === null ? "text-[#8e919b]" : "text-ink-3"}>{screens.length}</span>
          </Key>
          {FILTERS.map((f) => {
            const on = current === f;
            return (
              <Key key={f} size="sm" variant={on ? "primary" : "secondary"} aria-pressed={on} onClick={() => select(on ? null : f)} capClassName={filterCap}>
                {f}
                <span className={on ? "text-[#8e919b]" : "text-ink-3"}>{screens.filter((s) => inFilter(s, f)).length}</span>
              </Key>
            );
          })}
        </div>
      </header>

      <div className="columns-1 gap-4 px-5 pb-16 md:columns-2 md:gap-5 md:px-8 lg:columns-3 lg:px-12 lg:pb-24">
        {shown.map((s, i) => (
          <ScreenCard key={s.src} s={s} priority={i < 3} />
        ))}
      </div>
    </>
  );
}
