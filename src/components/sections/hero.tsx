"use client";

import Image from "next/image";
import { CornerDownLeft } from "@/components/aero-icons";
import { Eyebrow, Key, Legend } from "@/components/ui";
import { Marquee } from "@/components/marquee";
import { MarqueeCard } from "@/components/project-card";
import { heroWall } from "@/data/work";
import { site, socials } from "@/lib/site";

/* Recent work under the hero, on a slow sideways loop (the same marquee as the rest of the site); each card opens
   its project and shows the whole screen. */
function Wall() {
  return (
    <Marquee label="Recent work" duration={heroWall.length * 6} fade="w-[72px] md:w-40" className="w-full">
      {heroWall.map((t, i) => (
        <div key={t.shot.src} className="pb-1.5 pr-3 pt-1 md:pr-4">
          <MarqueeCard title={t.name} tag={t.tag} image={t.shot.src} index={i + 1} href={`/work/${t.slug}`} priority={i < 3} />
        </div>
      ))}
    </Marquee>
  );
}

export function Hero() {
  return (
    <section id="top" className="flex flex-col items-center gap-7 overflow-hidden border-b border-line px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16 lg:px-12">
      <div className="flex items-center gap-2.5">
        <a
          href={socials.x.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Farhan on X"
          className="size-[30px] shrink-0 rounded-full border border-line bg-white p-px"
        >
          <Image src="/assets/hero/avatar.png" alt="" width={56} height={56} className="size-full rounded-full object-cover" />
        </a>
        <Eyebrow label="Available for new projects" tone="live" />
      </div>

      <h1 className="font-heading max-w-[350px] text-balance text-center text-[34px] leading-[40px] tracking-[-0.68px] text-ink md:max-w-[740px] md:text-[48px] md:leading-[54px] md:tracking-[-0.96px] lg:max-w-none lg:text-[60px] lg:leading-[66px] lg:tracking-[-1.2px]">
        Design engineering for teams shipping better <br className="hidden lg:block" />
        <span className="text-ink-soft">digital experiences for their customers.</span>
      </h1>

      <p className="max-w-[720px] text-balance text-center text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2 md:text-[18px] md:leading-7 md:tracking-[-0.18px] lg:max-w-[860px]">
        I&apos;m Farhan, a design engineer for SaaS, AI, B2B and Web3 teams. Websites, dashboards, mobile apps, branding,
        pitch decks and animation, designed and built as one system.
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

      <div className="-mx-5 mt-4 self-stretch md:-mx-8 md:mt-8 lg:-mx-12">
        <Wall />
      </div>
    </section>
  );
}
