"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Command, CornerDownLeft } from "@untitled-ui/icons-react";
import { Key, Legend } from "@/components/ui";
import { FitToWidth } from "@/components/fit-to-width";
import { disciplines, useDiscipline, type DisciplineId } from "@/components/discipline";
import { site, socials } from "@/lib/site";

const rowA = disciplines.slice(0, 5);
const rowB = disciplines.slice(5);
const order = disciplines.map((d) => d.id);

const bigCap = "flex-col items-start justify-between whitespace-nowrap px-3.5 py-3";

const AUTOPLAY_MS = 1400;
const USER_PAUSE_MS = 6000;

function DisciplineKey({ d, onPick }: { d: (typeof disciplines)[number]; onPick: (id: DisciplineId) => void }) {
  const { active } = useDiscipline();
  const on = active === d.id;
  return (
    <Key
      size="lg"
      variant={on ? "accent" : "secondary"}
      pressed={on}
      aria-pressed={on}
      aria-label={d.title}
      onClick={() => onPick(d.id)}
      capClassName={`${bigCap} size-24`}
    >
      <span className="text-[22px] font-medium leading-7 tracking-[-0.22px]">{d.key}</span>
      <span className={`text-[12px] font-medium leading-4 tracking-[-0.12px] ${on ? "text-[#dce6ff]" : "text-ink-2"}`}>
        {d.short}
      </span>
    </Key>
  );
}

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
        <span className="absolute inset-0 animate-ping rounded-full bg-[#22c55e] opacity-60 motion-reduce:animate-none" />
        <span className="relative size-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_rgba(34,197,94,.7)]" />
      </span>
      <span suppressHydrationWarning>
        <span className="text-ink">Only 1 project slot left</span> for {month}
        <span className="hidden md:inline"> — book yours before it&apos;s gone.</span>
      </span>
    </span>
  );
}

function useAutoplay(plate: React.RefObject<HTMLDivElement | null>) {
  const { active, setActive } = useDiscipline();
  const activeRef = useRef(active);
  const lastUser = useRef(0);
  const hovering = useRef(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const el = plate.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    const id = window.setInterval(() => {
      if (!visible || hovering.current || document.hidden || Date.now() - lastUser.current < USER_PAUSE_MS) return;
      const next = order[(order.indexOf(activeRef.current) + 1) % order.length];
      setActive(next);
    }, AUTOPLAY_MS);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [plate, setActive]);

  return {
    pick: (id: DisciplineId) => {
      lastUser.current = Date.now();
      setActive(id);
    },
    hoverProps: {
      onPointerEnter: () => (hovering.current = true),
      onPointerLeave: () => (hovering.current = false),
    },
  };
}

export function Hero() {
  const plate = useRef<HTMLDivElement>(null);
  const { pick, hoverProps } = useAutoplay(plate);

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
        <SlotStatus />
      </div>

      <h1 className="font-heading max-w-[350px] text-balance text-center text-[34px] leading-[40px] tracking-[-0.68px] text-ink md:max-w-[740px] md:text-[48px] md:leading-[54px] md:tracking-[-0.96px] lg:max-w-none lg:text-[60px] lg:leading-[66px] lg:tracking-[-1.2px]">
        Helping companies create better <br className="hidden lg:block" />
        <span className="text-ink-3">digital experiences for their customers.</span>
      </h1>

      <p className="max-w-[720px] text-balance text-center text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2 md:text-[18px] md:leading-7 md:tracking-[-0.18px] lg:max-w-[900px]">
        Web, product, and brand design services for SaaS, AI, B2B, and Web3 teams. Websites, dashboards, mobile apps,
        branding, pitch decks, and animations—all in one unified service.
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

      <div className="hidden w-full flex-col items-center gap-5 pt-5 md:flex">
        <FitToWidth>
          <div
            ref={plate}
            {...hoverProps}
            className="plate flex flex-col gap-3 rounded-[28px] p-5"
            role="group"
            aria-label="Disciplines"
          >
            <div className="flex items-end gap-3">
              <Key size="lg" tabIndex={-1} aria-hidden="true" capClassName={`${bigCap} h-24 w-[148px]`}>
                <Command width={24} height={24} strokeWidth={1.2} className="text-ink" />
                <span className="text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-2">command</span>
              </Key>
              {rowA.map((d) => (
                <DisciplineKey key={d.id} d={d} onPick={pick} />
              ))}
            </div>
            <div className="flex items-end gap-3">
              {rowB.map((d) => (
                <DisciplineKey key={d.id} d={d} onPick={pick} />
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
        </FitToWidth>
        <p className="text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink-2">
          Ten disciplines, one designer. Pick a key.
        </p>
      </div>
    </section>
  );
}
