"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CornerDownLeft } from "@/components/aero-icons";
import { Eyebrow, Key, Legend } from "@/components/ui";
import { TransitionLink } from "@/components/view-transition";
import { heroWall } from "@/data/work";
import { site, socials } from "@/lib/site";

/* A strip of work under the hero. Each tile holds three projects and shows one at a time, whole (never cropped);
   every few seconds one tile, in a fixed shuffled order, cross-fades to its next project. */
const TILES = 5;
const ORDER = [2, 0, 4, 1, 3];
const STEP_MS = 2600;
const pools = Array.from({ length: TILES }, (_, t) => heroWall.filter((_, i) => i % TILES === t));

function shown(tile: number, step: number) {
  const at = ORDER.indexOf(tile);
  const turns = step > at ? Math.floor((step - at - 1) / TILES) + 1 : 0;
  return turns % pools[tile].length;
}

function Wall() {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => setStep((s) => s + 1), STEP_MS);
    });
    io.observe(root);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5 max-lg:md:[&>*:nth-child(n+4)]:hidden max-md:[&>*:nth-child(n+5)]:hidden"
      aria-label="Recent work"
    >
      {pools.map((pool, t) => {
        const current = shown(t, step);
        const tile = pool[current];
        return (
          <TransitionLink key={t} href={`/work/${tile.slug}`} className="group relative block aspect-[16/11] overflow-hidden rounded-[16px] border border-line bg-page" aria-label={tile.name}>
            {pool.map((p, i) => (
              <span
                key={p.shot.src}
                className={`absolute inset-[6%] flex items-center justify-center transition-opacity duration-700 ease-out motion-reduce:transition-none ${i === current ? "opacity-100" : "opacity-0"}`}
                aria-hidden={i !== current}
              >
                <Image
                  src={p.shot.src}
                  alt=""
                  width={p.shot.w}
                  height={p.shot.h}
                  sizes="(min-width: 1200px) 260px, (min-width: 744px) 30vw, 46vw"
                  quality={75}
                  priority={i === 0 && t < 2}
                  className="h-auto max-h-full w-auto max-w-full rounded-[6px] shadow-[0_0_0_1px_rgba(12,14,20,.06),0_12px_24px_-14px_rgba(12,14,20,.4)] transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.03]"
                />
              </span>
            ))}
            <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] uppercase leading-4 tracking-[0.06em] text-ink-2 opacity-0 shadow-[0_0_0_1px_rgba(12,14,20,.08)] transition-opacity duration-300 group-hover:opacity-100">
              {tile.name}
            </span>
          </TransitionLink>
        );
      })}
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="flex flex-col items-center gap-7 border-b border-line px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16 lg:px-12">
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

      <div className="mt-4 w-full md:mt-8">
        <Wall />
      </div>
    </section>
  );
}
