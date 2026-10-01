"use client";

import { useEffect, useState } from "react";
import { Eyebrow, Key } from "@/components/ui";
import { WorkCard } from "@/components/project-card";
import { byCategory, categories, newCount, projects, type Category } from "@/data/projects";
import { site } from "@/lib/site";

const slug = (c: string) => c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function GroupHeader({ name, meta }: { name: Category; meta?: string }) {
  const count = byCategory(name).length;
  const fresh = newCount(name);
  const text = meta ?? (fresh > 0 ? `${fresh} new from 2026` : undefined);
  return (
    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
      <Eyebrow label={name} count={count} />
      {text && <p className="text-[12px] leading-4 tracking-[-0.12px] text-ink-3">{text}</p>}
    </div>
  );
}

function Group({ name, meta, eager }: { name: Category; meta?: string; eager: boolean }) {
  const items = byCategory(name);
  const cols = [items.filter((p) => p.column === 0), items.filter((p) => p.column === 1)];
  const sorted = [...items].sort((a, b) => a.index - b.index);

  return (
    <section id={slug(name)} aria-label={name} className="flex scroll-mt-6 flex-col gap-5">
      <GroupHeader name={name} meta={meta} />
      <div className="hidden gap-4 md:flex">
        {cols.map((col, c) => (
          <div key={c} className="flex min-w-0 flex-1 flex-col gap-4">
            {col.map((p, i) => (
              <WorkCard key={p.index} project={p} priority={eager && i < 2} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 md:hidden">
        {sorted.map((p, i) => (
          <WorkCard key={p.index} project={p} priority={eager && i < 1} />
        ))}
      </div>
    </section>
  );
}

export function WorkIndex() {
  const [current, setCurrent] = useState<Category | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("category");
    const match = categories.find((c) => slug(c.name) === fromUrl);
    if (match) setCurrent(match.name);
  }, []);

  const select = (name: Category | null) => {
    setCurrent(name);
    window.history.replaceState(null, "", name ? `/work?category=${slug(name)}` : "/work");
  };

  const shown = current ? categories.filter((c) => c.name === current) : categories;
  const filterCap = "gap-2.5 px-3.5 py-2 text-[14px] font-medium leading-5 tracking-[-0.14px]";

  return (
    <>
      <header className="flex flex-col gap-8 px-5 py-12 md:gap-10 md:px-8 md:py-16 lg:gap-[58px] lg:px-12">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="01" label="All work" count={projects.length} />
          <h1 className="font-heading text-[44px] leading-[48px] tracking-[-0.88px] text-ink md:text-[56px] md:leading-[60px] md:tracking-[-1.12px] lg:text-[72px] lg:leading-[72px] lg:tracking-[-1.44px]">
            All work <span className="text-ink-3">all on one page.</span>
          </h1>
          <p className="max-w-[640px] text-[18px] leading-[26px] tracking-[-0.18px] text-ink-2">
            Everything from my portfolio: dashboards, web apps, mobile apps and landing pages for SaaS, AI, B2B and Web3
            teams. Screens from the same product sit side by side.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-2.5 gap-y-2 md:gap-y-2.5" role="toolbar" aria-label="Filter by category">
          <Key
            size="sm"
            variant={current === null ? "primary" : "secondary"}
            aria-pressed={current === null}
            onClick={() => select(null)}
            capClassName={filterCap}
          >
            All
            <span className={current === null ? "text-[#8e919b]" : "text-ink-3"}>{projects.length}</span>
          </Key>
          {categories.map((c) => {
            const on = current === c.name;
            return (
              <Key
                key={c.name}
                size="sm"
                variant={on ? "primary" : "secondary"}
                aria-pressed={on}
                onClick={() => select(on ? null : c.name)}
                capClassName={filterCap}
              >
                {c.name}
                <span className={on ? "text-[#8e919b]" : "text-ink-3"}>{byCategory(c.name).length}</span>
              </Key>
            );
          })}
          <span className="key key--sm cursor-default opacity-70" aria-disabled="true" title="Coming soon">
            <span className={`key__cap ${filterCap}`}>
              In progress
              <span className="text-ink-3">{site.inProgressCount}</span>
            </span>
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-8 px-5 pb-12 pt-2 md:gap-10 md:px-8 md:pb-16 lg:gap-16 lg:px-12 lg:pb-24 lg:pt-0">
        {shown.map((c, i) => (
          <Group key={c.name} name={c.name} meta={c.meta} eager={i === 0} />
        ))}
      </div>
    </>
  );
}
