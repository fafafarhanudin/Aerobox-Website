import Image from "next/image";

export type PortfolioShot = { name: string; summary: string; src: string; w: number; h: number };

/* A portfolio piece shown as a preview only: no full-size view, the image cannot be dragged out, and the
   files themselves are capped at 1600 px wide. */
export function PortfolioCard({ shot, priority }: { shot: PortfolioShot; priority?: boolean }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative block aspect-[4/3] select-none overflow-hidden rounded-[20px] border border-line bg-page">
        <div className="absolute inset-[6%] flex items-center justify-center">
          <Image
            src={shot.src}
            alt={`${shot.name} — ${shot.summary}`}
            width={shot.w}
            height={shot.h}
            sizes="(min-width: 1024px) 600px, (min-width: 744px) 44vw, 88vw"
            quality={80}
            priority={priority}
            draggable={false}
            className="pointer-events-none h-auto max-h-full w-auto max-w-full rounded-[8px] shadow-[0_0_0_1px_rgba(12,14,20,.06),0_20px_40px_-18px_rgba(12,14,20,.35)]"
          />
        </div>
      </div>
      <figcaption className="flex min-w-0 items-center gap-2.5 px-1">
        <span className="size-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
        <span className="shrink-0 text-[15px] font-medium leading-5 tracking-[-0.15px] text-ink">{shot.name}</span>
        <span className="truncate text-[14px] leading-5 tracking-[-0.14px] text-ink-3">{shot.summary}</span>
      </figcaption>
    </figure>
  );
}
