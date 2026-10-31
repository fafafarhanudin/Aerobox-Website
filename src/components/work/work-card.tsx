import Image from "next/image";
import { TransitionLink } from "@/components/view-transition";
import type { Work } from "@/data/work";

/* A project card: the screen sits inset on a soft panel and is cropped at the bottom, so it reads as a
   window into the product. The panel is named for the page transition only when clicked (see TransitionLink). */
export function WorkCard({ work, priority, sizes = "(min-width: 1024px) 660px, (min-width: 744px) 46vw, 92vw" }: { work: Work; priority?: boolean; sizes?: string }) {
  const portrait = work.cover.h > work.cover.w * 0.95; // phone collages and tall pages
  return (
    <TransitionLink href={`/work/${work.slug}`} className="group flex flex-col gap-3 rounded-[22px] outline-offset-4" aria-label={`${work.name}, ${work.summary}`}>
      <span
        className="relative block aspect-[4/3] overflow-hidden rounded-[20px] border border-line bg-page"
        data-vt-name={`work-${work.slug}`}
      >
        <span className="absolute inset-x-[7%] bottom-0 top-[8%] overflow-hidden rounded-t-[10px] shadow-[0_0_0_1px_rgba(12,14,20,.06),0_24px_48px_-20px_rgba(12,14,20,.35)] transition-transform duration-[700ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-2 group-hover:scale-[1.015] motion-reduce:transition-none">
          <Image
            src={work.cover.src}
            alt={`${work.name} — ${work.cover.caption}`}
            fill
            sizes={sizes}
            quality={85}
            priority={priority}
            className={`object-cover ${portrait ? "object-center" : "object-top"}`}
          />
        </span>
        <span className="absolute left-3 top-3 flex gap-1.5">
          {work.isCase && <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] uppercase leading-3 tracking-[0.08em] text-white">Case study</span>}
          {work.live && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-mono text-[10px] uppercase leading-3 tracking-[0.08em] text-ink shadow-[0_0_0_1px_rgba(12,14,20,.08)]">
              <span className="size-1.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
              Live
            </span>
          )}
        </span>
      </span>
      <span className="flex items-center justify-between gap-4 px-1">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="size-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
          <span className="shrink-0 text-[15px] font-medium leading-5 tracking-[-0.15px] text-ink">{work.name}</span>
          <span className="truncate text-[14px] leading-5 tracking-[-0.14px] text-ink-3">{work.summary}</span>
        </span>
        <span
          className="shrink-0 text-[15px] leading-5 text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
          aria-hidden="true"
        >
          ↗
        </span>
      </span>
    </TransitionLink>
  );
}
