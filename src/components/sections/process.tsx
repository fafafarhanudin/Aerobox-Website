import { Eyebrow } from "@/components/ui";
import { ProcessBoard, type Step } from "@/components/sections/process-board";

const steps: Step[] = [
  {
    phase: "Discover",
    title: "Brief discussion",
    body: "We pin down goals, users and what done looks like. You get a written scope before any design starts.",
    output: "Scope document",
  },
  {
    phase: "Define",
    title: "Wireframes",
    body: "Structure before style. Low-fidelity flows to agree on content, hierarchy and edge cases.",
    output: "Clickable wireframes",
  },
  {
    phase: "Design",
    title: "Visual design",
    body: "High-fidelity screens in Figma, built on components your developers can reuse.",
    output: "Figma file + design system",
  },
  {
    phase: "Deliver",
    title: "Handoff",
    body: "Responsive specs, prototypes and a walkthrough. I stay on call while it gets built.",
    output: "Dev-ready specs",
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
          <Eyebrow index="03" label="Process" count={`${steps.length} steps`} className="eyebrow--dark" />
          <h2 className="font-heading text-[30px] leading-[36px] tracking-[-0.72px] text-white md:text-[36px] md:leading-[44px] lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            How a project runs, <span className="text-white/45">brief to handoff.</span>
          </h2>
        </div>
        <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-white/55 md:max-w-[321px] md:text-right lg:max-w-[456px]">
          Four steps, the same for a landing page or a full product. You always know what comes next and what you get at
          the end of it.
        </p>
      </div>
      <ProcessBoard steps={steps} />
    </section>
  );
}
