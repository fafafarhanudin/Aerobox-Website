"use client";

import Image from "next/image";
import { Command, CornerDownLeft } from "@untitled-ui/icons-react";
import { Key, Legend } from "@/components/ui";
import { disciplines, useDiscipline } from "@/components/discipline";
import { site, socials } from "@/lib/site";

const rowA = disciplines.slice(0, 5);
const rowB = disciplines.slice(5);

const bigCap = "flex-col items-start justify-between whitespace-nowrap px-3.5 py-3";

function DisciplineKey({ d }: { d: (typeof disciplines)[number] }) {
  const { active, setActive } = useDiscipline();
  const on = active === d.id;
  return (
    <Key
      size="lg"
      variant={on ? "accent" : "secondary"}
      pressed={on}
      aria-pressed={on}
      aria-label={d.title}
      onClick={() => setActive(d.id)}
      capClassName={`${bigCap} size-24`}
    >
      <span className="text-[22px] font-medium leading-7 tracking-[-0.22px]">{d.key}</span>
      <span className={`text-[12px] font-medium leading-4 tracking-[-0.12px] ${on ? "text-[#dce6ff]" : "text-ink-2"}`}>
        {d.short}
      </span>
    </Key>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="flex flex-col items-center gap-8 border-b border-line px-5 pb-14 pt-12 md:px-8 md:pb-[72px] lg:px-12 lg:pb-24"
    >
      <div className="flex items-center gap-2">
        <a
          href={socials.x.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Farhan on X"
          className="hidden size-[30px] shrink-0 rounded-full border border-line bg-white p-px md:block"
        >
          <Image src="/assets/hero/avatar.png" alt="" width={56} height={56} className="size-full rounded-full object-cover" />
        </a>
        <span className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2.5 pr-3 text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-2">
          <Image src="/assets/hero/dot.svg" alt="" width={8} height={8} className="shrink-0" />
          <span className="hidden md:inline">{site.heroStatus}</span>
          <span className="md:hidden">{site.heroStatusShort}</span>
        </span>
      </div>

      <h1 className="font-heading max-w-[350px] text-center text-[48px] leading-[53px] tracking-[-0.96px] text-ink md:max-w-none md:text-[56px] md:leading-[60px] md:tracking-[-1.12px] lg:text-[72px] lg:leading-[76px] lg:tracking-[-0.72px]">
        Designing world-class <br className="hidden md:block" />
        <span className="text-ink-3 lg:tracking-[-0.16px]">digital experiences.</span>
      </h1>

      <p className="max-w-[656px] text-center text-[18px] leading-7 tracking-[-0.18px] text-ink-2">
        Founder of Aerobox Design. Three years designing websites, dashboards, mobile apps and brand systems for 60+
        SaaS, AI, B2B and Web3 teams.
      </p>

      <div className="flex w-full flex-col items-stretch gap-2.5 md:w-auto md:flex-row md:items-end md:gap-3">
        <Key
          href={site.telegram}
          variant="primary"
          capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]"
        >
          Send a message
          <Legend>
            <CornerDownLeft width={12} height={12} strokeWidth={1.2} />
          </Legend>
        </Key>
        <Key href="/work" capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]">
          View work
          <Legend>V</Legend>
        </Key>
      </div>

      <div className="hidden flex-col items-center gap-5 pt-5 md:flex">
        <div className="origin-top md:max-lg:scale-[0.97]">
          <div className="plate flex flex-col gap-3 rounded-[28px] p-5" role="group" aria-label="Disciplines">
            <div className="flex items-end gap-3">
              <Key size="lg" tabIndex={-1} aria-hidden="true" capClassName={`${bigCap} h-24 w-[148px]`}>
                <Command width={24} height={24} strokeWidth={1.2} className="text-ink" />
                <span className="text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-2">command</span>
              </Key>
              {rowA.map((d) => (
                <DisciplineKey key={d.id} d={d} />
              ))}
            </div>
            <div className="flex items-end gap-3">
              {rowB.map((d) => (
                <DisciplineKey key={d.id} d={d} />
              ))}
              <Key
                href={site.telegram}
                variant="primary"
                size="lg"
                aria-label="Let's talk on Telegram"
                capClassName={`${bigCap} h-24 w-[148px]`}
              >
                <CornerDownLeft width={24} height={24} strokeWidth={1.2} className="text-white" />
                <span className="text-[12px] font-medium leading-4 tracking-[-0.12px] text-[#a9abb3]">return</span>
              </Key>
            </div>
          </div>
        </div>
        <p className="text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink-2">
          Ten disciplines, one designer. Pick a key.
        </p>
      </div>
    </section>
  );
}
