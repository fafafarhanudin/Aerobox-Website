import { Eyebrow } from "@/components/ui";
import { ProcessBoard, type Step } from "@/components/sections/process-board";

const steps: Step[] = [
  {
    phase: "Kickoff",
    title: "Kickoff and scope",
    body: "We talk through the product, the people using it and what success looks like. You get a written scope, timeline and price before any pixels move.",
    output: "Scope, timeline and price",
  },
  {
    phase: "Structure",
    title: "Flows before pixels",
    body: "Every screen gets its job first. Low-fidelity flows settle content, order and edge cases while changes are still cheap.",
    output: "Clickable wireframes",
  },
  {
    phase: "Craft",
    title: "Screens and system",
    body: "Final UI in Figma, built from a component library with tokens, states and responsive rules your team can keep using.",
    output: "Figma file and design system",
  },
  {
    phase: "Ship",
    title: "Build and launch",
    body: "Specs, prototypes and a walkthrough for your developers, or I build it myself in Framer or code. I stay on call through launch.",
    output: "Dev-ready handoff or a live site",
  },
];

export function Process() {
  return (
    <section
      id="process"
      className="flex scroll-mt-16 flex-col gap-8 border-b border-line bg-[#0c0c0d] px-5 py-14 md:gap-10 md:px-8 md:py-[72px] lg:px-12 lg:py-24"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="03" label="Process" count={`${steps.length} stages`} className="eyebrow--dark" />
          <h2 className="font-heading text-[30px] leading-[36px] tracking-[-0.72px] text-white md:text-[36px] md:leading-[44px] lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            From first call to launch, <span className="text-white/45">in four stages.</span>
          </h2>
        </div>
        <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-white/55 md:max-w-[321px] md:text-right lg:max-w-[456px]">
          A landing page or a whole product runs the same way. Each stage ends with something you can review and sign off
          before the next one starts.
        </p>
      </div>
      <ProcessBoard steps={steps} />
    </section>
  );
}
