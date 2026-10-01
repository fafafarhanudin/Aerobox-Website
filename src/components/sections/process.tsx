"use client";

import { useState } from "react";
import {Command} from "@untitled-ui/icons-react";
import { Eyebrow } from "@/components/ui";

const steps = [
  {
    title: "Brief discussion",
    body: "We pin down goals, users and what done looks like. You get a written scope before any design starts.",
    deliverable: "Scope document",
  },
  {
    title: "Wireframes",
    body: "Structure before style. Low-fidelity flows to agree on content, hierarchy and edge cases.",
    deliverable: "Clickable wireframes",
  },
  {
    title: "Visual design",
    body: "High-fidelity screens in Figma, built on components your developers can reuse.",
    deliverable: "Figma file + design system",
  },
  {
    title: "Handoff",
    body: "Responsive specs, prototypes and a walkthrough. I stay on call while it gets built.",
    deliverable: "Dev-ready specs",
  },
];

function StaticKey({ variant, children }: { variant: "primary" | "accent"; children: React.ReactNode }) {
  return (
    <span className={`key key--sm key--${variant}`} aria-hidden="true" style={{ cursor: "default" }}>
      <span className="key__cap size-9 text-[14px] font-medium leading-5 tracking-[-0.14px]">{children}</span>
    </span>
  );
}

export function Process() {
  const [active, setActive] = useState(2);

  return (
    <section
      id="process"
      className="flex scroll-mt-4 flex-col gap-8 border-b border-line px-5 py-14 md:gap-10 md:px-8 md:py-[72px] lg:px-[clamp(48px,8.33vw,120px)] lg:py-24"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="03" label="Process" count={`${steps.length} steps`} />
          <h2 className="font-heading text-[36px] leading-[44px] tracking-[-0.36px] text-ink lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.44px]">
            How a project runs,
            <br />
            from brief to handoff
          </h2>
        </div>
        <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2 md:max-w-[321px] md:text-right lg:max-w-[496px]">
          Four steps, the same for a landing page or a full product. You always know what comes next and what you will
          get at the end of it.
        </p>
      </div>

      <ol className="grid grid-cols-1 rounded-3xl bg-ink p-2 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => {
          const on = active === i;
          return (
            <li
              key={s.title}
              tabIndex={0}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`flex flex-col justify-between gap-5 rounded-[18px] border p-4 outline-offset-[-2px] transition-colors duration-150 md:p-6 ${
                on ? "border-[#34363d] bg-gradient-to-b from-[#26282e] to-[#1e2025]" : "border-transparent"
              }`}
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-1.5">
                  <StaticKey variant="primary">
                    <Command width={16} height={16} strokeWidth={1.2} />
                  </StaticKey>
                  <span className="text-[14px] font-medium leading-5 text-ink-2">+</span>
                  <StaticKey variant={on ? "accent" : "primary"}>{i + 1}</StaticKey>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[20px] font-medium leading-7 tracking-[-0.2px] text-white">{s.title}</h3>
                  <p className="text-[14px] leading-[22px] tracking-[-0.14px] text-[#9a9ca5]">{s.body}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-[#2c2e34] pt-3.5">
                <span
                  className={`size-1.5 rounded-full transition-colors duration-150 ${on ? "bg-accent" : "bg-[#6b6e78]"}`}
                  aria-hidden="true"
                />
                <span className="text-[12px] font-medium leading-4 tracking-[-0.12px] text-[#c8cad2]">
                  {s.deliverable}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
