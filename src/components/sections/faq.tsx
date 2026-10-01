"use client";

import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { CornerDownLeft, HelpCircle, Minus, Plus } from "@untitled-ui/icons-react";
import { Chip, Key, Legend, chipIcon } from "@/components/ui";
import { site } from "@/lib/site";

const faqs = [
  {
    q: "How long does a design project take?",
    a: "A landing page usually takes one to two weeks. A product or dashboard takes four to eight, depending on how many screens and flows it needs. You get the timeline together with the scope, before anything starts.",
  },
  {
    q: "How many revisions do I get?",
    a: "Unlimited, within the agreed scope. We keep refining until the design matches the brief, and every round comes with notes on what changed and why.",
  },
  {
    q: "What do I receive at the end?",
    a: "A Figma file with every screen, responsive layouts, components and styles, plus a clickable prototype. It is organised so your developers can build straight from it.",
  },
  {
    q: "Can you work with my existing brand or design system?",
    a: "Yes. I extend what you already have and keep it consistent. If there is no system yet, I build one as part of the project.",
  },
  {
    q: "What tools do you design in?",
    a: "Figma, from the first wireframe to the final prototype, with auto layout and components throughout. Motion and interactions are prototyped in Figma too.",
  },
  {
    q: "How can I pay you?",
    a: "Whichever is easiest for you: crypto (USDT, USDC and other major coins), Wise bank transfer, or Contra. I send the invoice through the method you pick, so international payments stay simple.",
  },
];

export function Faq() {
  const [open, setOpen] = useState("item-0");

  return (
    <section
      id="faq"
      className="flex scroll-mt-4 flex-col gap-8 border-b border-line px-5 py-14 md:gap-10 md:px-8 md:py-[72px] lg:flex-row lg:gap-16 lg:px-[clamp(48px,8.33vw,120px)] lg:py-24"
    >
      <div className="flex flex-col items-start gap-6 lg:w-[400px] lg:shrink-0">
        <Chip icon={<HelpCircle {...chipIcon} />} label="FAQ" count={faqs.length} />
        <h2 className="font-heading text-[28px] leading-[34px] tracking-[-0.28px] text-ink md:text-[36px] md:leading-[52px] lg:text-[44px] lg:tracking-[-0.44px]">
          Questions, answered
        </h2>
        <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">
          The things clients ask before we start. Anything else? Send a message and I&apos;ll reply the same day.
        </p>
        <Key href={site.telegram} capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]">
          Send a message
          <Legend>
            <CornerDownLeft width={12} height={12} strokeWidth={1.2} />
          </Legend>
        </Key>
      </div>

      <Accordion.Root type="single" collapsible value={open} onValueChange={setOpen} className="flex min-w-0 flex-1 flex-col">
        {faqs.map((f, i) => (
          <Accordion.Item
            key={f.q}
            value={`item-${i}`}
            className="group rounded-xl px-4 transition-colors duration-150 hover:bg-subtle/60 data-[state=open]:bg-white"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full cursor-pointer items-start gap-6 py-6 text-left transition-[padding] duration-[240ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-data-[state=open]:pb-2">
                <span className="flex-1 text-[18px] font-medium leading-[26px] tracking-[-0.18px] text-ink">{f.q}</span>
                <span className={`key key--sm [--r:8px] ${open === `item-${i}` ? "key--primary" : ""}`} aria-hidden="true">
                  <span className="key__cap size-7 rounded-[4px]">
                    <Plus width={14} height={14} strokeWidth={1.2} className="text-ink group-data-[state=open]:hidden" />
                    <Minus width={14} height={14} strokeWidth={1.2} className="hidden text-white group-data-[state=open]:block" />
                  </span>
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="faq-content overflow-hidden">
              <p className="pb-6 pr-[58px] text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">{f.a}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
