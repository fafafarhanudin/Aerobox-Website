"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CornerDownLeft } from "@/components/aero-icons";
import { Key, Legend } from "@/components/ui";
import { TransitionLink } from "@/components/view-transition";
import { heroWall } from "@/data/work";
import { site, socials } from "@/lib/site";

function useMonthName() {
  const [month, setMonth] = useState<string | null>(null);
  useEffect(() => {
    setMonth(new Intl.DateTimeFormat("en-US", { month: "long", timeZone: site.timeZone }).format(new Date()));
  }, []);
  return month ?? "this month";
}

function SlotStatus() {
  const month = useMonthName();
  return (
    <span className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2.5 pr-3 text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-2">
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#2f6bff] opacity-60 motion-reduce:animate-none" />
        <span className="relative size-2 rounded-full bg-[#2f6bff] shadow-[0_0_6px_rgba(47,107,255,.7)]" />
      </span>
      <span suppressHydrationWarning>
        <span className="text-ink">1 project slot left</span> for {month}
      </span>
    </span>
  );
}

/* Five columns of real screens drifting slowly against each other, fading out at the bottom.
   Each tile opens its project. */
const COLUMNS = 5;
const OFFSET = [0, 56, 18, 72, 36];

function Wall() {
  const columns = Array.from({ length: COLUMNS }, (_, c) => heroWall.filter((_, i) => i % COLUMNS === c));
  return (
    <div className="hero-wall relative -mx-5 h-[420px] overflow-hidden md:-mx-8 md:h-[560px] lg:-mx-12" aria-label="Recent work">
      <div className="absolute inset-x-0 top-0 flex justify-center gap-3 px-3 md:gap-4">
        {columns.map((col, c) => (
          <div
            key={c}
            className={`hero-wall__col flex w-[46vw] max-w-[280px] shrink-0 flex-col gap-3 md:w-[19vw] md:gap-4 ${c > 2 ? "max-md:hidden" : ""}`}
            style={{ marginTop: OFFSET[c], animationDelay: `${-c * 3.2}s`, animationDirection: c % 2 ? "reverse" : "normal" }}
          >
            {col.map((t, i) => (
              <TransitionLink
                key={t.shot.src}
                href={`/work/${t.slug}`}
                className="group block overflow-hidden rounded-[14px] border border-line bg-page p-1.5"
                aria-label={t.name}
                tabIndex={-1}
              >
                <span className="relative block aspect-[7/5] overflow-hidden rounded-[9px]">
                  <Image
                    src={t.shot.src}
                    alt=""
                    fill
                    sizes="(min-width: 744px) 19vw, 46vw"
                    quality={75}
                    priority={i === 0 && c < 3}
                    className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.03]"
                  />
                </span>
              </TransitionLink>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="flex flex-col items-center gap-7 overflow-hidden border-b border-line px-5 pt-12 md:px-8 md:pt-16 lg:px-12">
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
        <SlotStatus />
      </div>

      <h1 className="font-heading max-w-[350px] text-balance text-center text-[36px] leading-[40px] tracking-[-0.72px] text-ink md:max-w-[940px] md:text-[56px] md:leading-[60px] md:tracking-[-1.4px] lg:text-[68px] lg:leading-[70px] lg:tracking-[-1.9px]">
        Product and web design, <span className="text-ink-soft">from one studio.</span>
      </h1>

      <p className="max-w-[560px] text-balance text-center text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2 md:text-[18px] md:leading-7 md:tracking-[-0.18px]">
        I&apos;m Farhan. I design dashboards, web apps, websites and brands for SaaS, AI and Web3 teams, from first sketch
        to handoff.
      </p>

      <div className="flex w-full flex-col items-stretch gap-2.5 md:w-auto md:flex-row md:items-end md:gap-3">
        <Key href={site.telegram} variant="primary" capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]">
          Send a message
          <Legend>
            <CornerDownLeft width={12} height={12} strokeWidth={1.8} />
          </Legend>
        </Key>
        <Key href="/work" capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]">
          View work
          <Legend>V</Legend>
        </Key>
      </div>

      <div className="mt-6 w-full md:mt-10">
        <Wall />
      </div>
    </section>
  );
}
