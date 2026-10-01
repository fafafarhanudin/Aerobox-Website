import { MessageSmileCircle } from "@untitled-ui/icons-react";
import { Chip, chipIcon } from "@/components/ui";
import { Marquee } from "@/components/marquee";

const quotes = [
  { initials: "DR", quote: "Farhan asked the right questions early, so we barely had to redo any screens.", by: "Daniel R. · Head of Product, SaaS" },
  { initials: "AN", quote: "Easy to work with and quick with revisions. The dashboard turned out cleaner than we expected.", by: "Aisha N. · Co-founder, B2B marketplace" },
  { initials: "MS", quote: "People finally get what our product does from the first screen of the landing page.", by: "Maya S. · Founder, AI startup", accent: true },
  { initials: "LP", quote: "The pitch deck looked polished and our numbers were much easier to follow.", by: "Leo P. · CEO, fintech" },
  { initials: "TH", quote: "Every file was organised and ready for our developers, which saved us a lot of back-and-forth.", by: "Tom H. · CTO, Web3 wallet" },
  { initials: "SL", quote: "He replies fast and always delivers on time. It felt like having a designer on the team.", by: "Sarah L. · Product lead, dev tools" },
];

export function Testimonials() {
  return (
    <section aria-label="What clients say" className="flex flex-col items-center gap-4 border-b border-line py-8">
      <Chip icon={<MessageSmileCircle {...chipIcon} />} label="What clients say" />
      <Marquee label="Client testimonials" duration={80} direction="right" fade="w-20 md:w-[200px]" className="w-full">
        {quotes.map((q) => (
          <figure
            key={q.initials}
            className="mb-2 mr-3 mt-1 flex shrink-0 items-center gap-3 rounded-xl border border-line bg-white py-3.5 pl-2.5 pr-[18px]"
          >
            <span className={`key key--sm ${q.accent ? "key--accent" : ""}`} aria-hidden="true" style={{ cursor: "default", boxShadow: q.accent ? undefined : "0 4px 8px -2px rgba(12,14,20,.1), 0 1px 1px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.7)" }}>
              <span className="key__cap size-7 text-[10px] font-medium leading-3 tracking-[-0.1px]">{q.initials}</span>
            </span>
            <div className="flex flex-col gap-0.5">
              <blockquote className="w-[344px] text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink">
                “{q.quote}”
              </blockquote>
              <figcaption className="whitespace-nowrap text-[12px] leading-4 tracking-[-0.12px] text-ink-2">{q.by}</figcaption>
            </div>
          </figure>
        ))}
      </Marquee>
    </section>
  );
}
