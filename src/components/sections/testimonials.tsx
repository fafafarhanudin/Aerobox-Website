
import { Eyebrow } from "@/components/ui";
import { Marquee } from "@/components/marquee";

const quotes = [
  { initials: "DR", quote: "Farhan asked the right questions early, so we barely had to redo any screens.", by: "Daniel R. · Head of Product, SaaS" },
  { initials: "AN", quote: "Easy to work with and quick with revisions. The dashboard turned out cleaner than we expected.", by: "Aisha N. · Co-founder, B2B marketplace" },
  { initials: "MS", quote: "People finally get what our product does from the first screen of the landing page.", by: "Maya S. · Founder, AI startup", accent: true },
  { initials: "LP", quote: "The pitch deck looked polished and our numbers were much easier to follow.", by: "Leo P. · CEO, fintech" },
  { initials: "TH", quote: "Every file was organised and ready for our developers, which saved us a lot of back-and-forth.", by: "Tom H. · CTO, Web3 wallet" },
  { initials: "SL", quote: "He replies fast and always delivers on time. It felt like having a designer on the team.", by: "Sarah L. · Product lead, dev tools" },
];

const rows = [quotes, [...quotes.slice(3), ...quotes.slice(0, 3)]];

function Quote({ q }: { q: (typeof quotes)[number] }) {
  return (
    <figure className="mb-2 mr-2.5 mt-1 flex h-[128px] w-[260px] shrink-0 flex-col justify-between rounded-xl border border-line bg-white p-3.5 md:mr-3 md:h-[136px] md:w-[300px] md:p-4">
      <blockquote className="line-clamp-3 text-[13px] font-medium leading-[19px] tracking-[-0.13px] text-ink md:text-[14px] md:leading-5 md:tracking-[-0.14px]">
        “{q.quote}”
      </blockquote>
      <figcaption className="flex min-w-0 items-center gap-2.5">
        <span className={`key key--sm [--r:8px] ${q.accent ? "key--accent" : ""}`} aria-hidden="true" style={{ cursor: "default", "--depth": "3px" } as React.CSSProperties}>
          <span className="key__cap size-6 text-[9px] font-medium leading-3">{q.initials}</span>
        </span>
        <span className="truncate text-[12px] leading-4 tracking-[-0.12px] text-ink-2">{q.by}</span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <section aria-label="What clients say" className="flex flex-col items-center gap-4 border-b border-line py-8">
      <Eyebrow index="06" label="What clients say" />
      <div className="flex w-full flex-col gap-1">
        {rows.map((row, r) => (
          <Marquee
            key={r}
            label={r === 0 ? "Client testimonials" : "More client testimonials"}
            duration={60}
            direction={r === 0 ? "right" : "left"}
            fade="w-16 md:w-[200px]"
            className="w-full"
          >
            {row.map((q) => (
              <Quote key={q.initials} q={q} />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
