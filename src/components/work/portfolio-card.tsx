"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ViewCursor } from "@/components/work/view-cursor";

export type PortfolioShot = { name: string; summary: string; src: string; w: number; h: number };

/* A portfolio piece without its own page: the card opens the screen full size in a dialog. */
export function PortfolioCard({ shot, priority }: { shot: PortfolioShot; priority?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    const close = (e: MouseEvent) => e.target === d && d?.close();
    d?.addEventListener("click", close);
    return () => d?.removeEventListener("click", close);
  }, []);

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className="group flex flex-col gap-3 rounded-[22px] text-left outline-offset-4" aria-label={`${shot.name}, ${shot.summary}. Open full size`}>
        <ViewCursor>
          <span className="relative block aspect-[4/3] overflow-hidden rounded-[20px] border border-line bg-page">
            <span className="absolute inset-[6%] flex items-center justify-center">
              <Image
                src={shot.src}
                alt={`${shot.name} — ${shot.summary}`}
                width={shot.w}
                height={shot.h}
                sizes="(min-width: 1024px) 600px, (min-width: 744px) 44vw, 88vw"
                quality={85}
                priority={priority}
                className="h-auto max-h-full w-auto max-w-full rounded-[8px] shadow-[0_0_0_1px_rgba(12,14,20,.06),0_20px_40px_-18px_rgba(12,14,20,.35)] transition-transform duration-[700ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.02] motion-reduce:transition-none"
              />
            </span>
          </span>
        </ViewCursor>
        <span className="flex items-center justify-between gap-4 px-1">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="size-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
            <span className="shrink-0 text-[15px] font-medium leading-5 tracking-[-0.15px] text-ink">{shot.name}</span>
            <span className="truncate text-[14px] leading-5 tracking-[-0.14px] text-ink-3">{shot.summary}</span>
          </span>
          <span className="shrink-0 text-[15px] leading-5 text-ink-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true">
            ↗
          </span>
        </span>
      </button>
      <dialog ref={dialog} className="m-auto max-h-[92vh] w-[min(1400px,94vw)] overflow-hidden rounded-[18px] bg-transparent p-0 backdrop:bg-[rgba(12,14,20,.72)] backdrop:backdrop-blur-sm">
        <div className="relative">
          <Image src={shot.src} alt={`${shot.name} — ${shot.summary}`} width={shot.w} height={shot.h} sizes="94vw" quality={90} className="block h-auto max-h-[92vh] w-full object-contain" />
          <button type="button" onClick={() => dialog.current?.close()} className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-medium text-ink shadow" aria-label="Close">
            Close ✕
          </button>
        </div>
      </dialog>
    </>
  );
}
