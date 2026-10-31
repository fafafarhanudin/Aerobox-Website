"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Animator } from "@/components/figures/animator";

export type Step = { phase: string; title: string; body: string; output: string };

const AUTOPLAY_MS = 3400;

/* The rail figure and the four columns share one active step: the shuttle drives to that station while the column
   lights up. It advances on its own while in view; pointing at or focusing a column takes over. On phones the
   figure is wider than the screen and pans to the active station. */
export function ProcessBoard({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [stops, setStops] = useState<number[]>([0.25, 0.42, 0.58, 0.75]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || held || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => setActive((a) => (a + 1) % steps.length), AUTOPLAY_MS);
    });
    io.observe(root);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [held, steps.length]);

  return (
    <div ref={ref} className="overflow-hidden rounded-[22px] border border-white/10" onPointerLeave={() => setHeld(false)}>
      <div className="overflow-hidden border-b border-white/10 px-2 py-6 md:px-6 md:py-8">
        <div
          className="process-pan w-[260%] transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none md:w-full"
          style={{ "--pan": `${(0.5 / 2.6 - stops[active]) * 100}%` } as CSSProperties}
        >
          <Animator
            name="process"
            ratio="1120 / 300"
            stage={active}
            className="iso fig-dark"
            onReady={(svg) => {
              const read = svg.dataset.stations?.split(" ").map(Number);
              if (read?.length === 4) setStops(read);
            }}
          />
        </div>
      </div>
      <ol className="grid md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => {
          const on = active === i;
          return (
            <li
              key={s.phase}
              tabIndex={0}
              onPointerEnter={() => {
                setHeld(true);
                setActive(i);
              }}
              onFocus={() => {
                setHeld(true);
                setActive(i);
              }}
              onBlur={() => setHeld(false)}
              aria-current={on ? "step" : undefined}
              className={`flex flex-col gap-5 border-white/10 p-5 outline-offset-[-2px] transition-colors duration-300 md:p-6 max-md:[&:not(:first-child)]:border-t md:even:border-l lg:border-l lg:first:border-l-0 md:[&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-t-0 ${
                on ? "bg-white/[0.04]" : ""
              }`}
            >
              <span className={`flex items-center gap-2 font-mono text-[11px] uppercase leading-4 tracking-[0.1em] transition-colors duration-300 ${on ? "text-white" : "text-white/40"}`}>
                <span className={`size-1.5 rounded-full transition-colors duration-300 ${on ? "bg-white" : "bg-white/25"}`} aria-hidden="true" />
                0{i + 1} · {s.phase}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-medium leading-7 tracking-[-0.2px] text-white">{s.title}</h3>
                <p className="text-[14px] leading-[22px] tracking-[-0.14px] text-white/55">{s.body}</p>
              </div>
              <p className="mt-auto border-t border-white/10 pt-3.5 text-[13px] leading-5 tracking-[-0.13px] text-white/50">
                <span aria-hidden="true">↳ </span>
                {s.output}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
