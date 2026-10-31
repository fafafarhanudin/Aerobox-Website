"use client";

import { useEffect, useState } from "react";
import { Eyebrow, Key } from "@/components/ui";
import { WorkCard } from "@/components/work/work-card";
import { workCategories, works } from "@/data/work";

type Filter = (typeof workCategories)[number]["name"];
const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-");

export function WorkIndex() {
  const [current, setCurrent] = useState<Filter | null>(null);

  // ?category=… deep links (and the old links that pointed at a category)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("category");
    const match = workCategories.find((c) => slug(c.name) === q);
    if (match) setCurrent(match.name);
  }, []);

  const select = (name: Filter | null) => {
    setCurrent(name);
    window.history.replaceState(null, "", name ? `/work?category=${slug(name)}` : "/work");
  };

  const shown = works.filter((w) => !current || (current === "Case studies" ? w.isCase : w.category === current));
  const filterCap = "gap-2.5 px-3.5 py-2 text-[14px] font-medium leading-5 tracking-[-0.14px]";

  return (
    <>
      <header className="flex flex-col gap-8 px-5 py-12 md:gap-10 md:px-8 md:py-16 lg:gap-[58px] lg:px-12">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="01" label="Work" count={works.length} />
          <h1 className="font-heading text-[44px] leading-[48px] tracking-[-0.88px] text-ink md:text-[56px] md:leading-[60px] md:tracking-[-1.12px] lg:text-[72px] lg:leading-[72px] lg:tracking-[-1.44px]">
            Selected projects, <span className="text-ink-soft">up close.</span>
          </h1>
          <p className="max-w-[640px] text-[18px] leading-[26px] tracking-[-0.18px] text-ink-2">
            {works.length} projects for SaaS, AI, B2B and Web3 teams. Open one to see every screen at full size, or start
            with the case studies.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-2.5 gap-y-2 md:gap-y-2.5" role="toolbar" aria-label="Filter by category">
          <Key size="sm" variant={current === null ? "primary" : "secondary"} aria-pressed={current === null} onClick={() => select(null)} capClassName={filterCap}>
            All
            <span className={current === null ? "text-[#8e919b]" : "text-ink-3"}>{works.length}</span>
          </Key>
          {workCategories.map((c) => {
            const on = current === c.name;
            return (
              <Key key={c.name} size="sm" variant={on ? "primary" : "secondary"} aria-pressed={on} onClick={() => select(on ? null : c.name)} capClassName={filterCap}>
                {c.name}
                <span className={on ? "text-[#8e919b]" : "text-ink-3"}>{c.count}</span>
              </Key>
            );
          })}
        </div>
      </header>

      <div className="grid gap-x-6 gap-y-10 px-5 pb-16 md:grid-cols-2 md:gap-y-12 md:px-8 lg:px-12 lg:pb-24">
        {shown.map((w, i) => (
          <WorkCard key={w.slug} work={w} priority={i < 2} />
        ))}
      </div>
    </>
  );
}
