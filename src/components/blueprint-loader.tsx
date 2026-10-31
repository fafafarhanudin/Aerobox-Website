import type { CSSProperties, ReactNode } from "react";

/* The first visit opens on a blueprint of the page it is about to show: the boxes of the nav, the title,
   the buttons and the work wall draw themselves on a graphite sheet, then the sheet lifts away.
   Pure CSS (globals.css, "blueprint loader"); an inline script skips it after the first page of a session,
   and reduced motion never sees it. */

function Box({ i, label, cross, className = "", children }: { i: number; label?: string; cross?: boolean; className?: string; children?: ReactNode }) {
  return (
    <div className={`bp-box ${className}`} style={{ "--i": i } as CSSProperties}>
      {cross && (
        <svg className="bp-box__x" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 0L100 100M100 0L0 100" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {label && <span className="bp-box__label">{label}</span>}
      {children}
    </div>
  );
}

const skip = `try{if(matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("aerobox-bp"))document.documentElement.classList.add("bp-skip");else sessionStorage.setItem("aerobox-bp","1")}catch(e){document.documentElement.classList.add("bp-skip")}`;

export function BlueprintLoader() {
  const plates = [0, 1, 2, 3, 4];
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: skip }} />
      <div className="bp" aria-hidden="true">
        <div className="bp__sheet mx-auto flex h-full max-w-[1440px] flex-col">
          <Box i={0} label="Nav · 80" className="flex h-[73px] shrink-0 items-center justify-between gap-6 px-5 md:h-20 md:px-6">
            <Box i={1} label="Logo" className="h-9 w-[120px]" />
            <span className="hidden flex-1 gap-3 lg:flex">
              <Box i={2} label="01" className="h-7 w-[92px]" />
              <Box i={3} label="02" className="h-7 w-[72px]" />
              <Box i={4} label="03" className="h-7 w-[64px]" />
            </span>
            <Box i={5} label="CTA" className="h-11 w-[110px] md:w-[132px]" />
          </Box>

          <div className="flex flex-1 flex-col items-center gap-7 overflow-hidden px-5 pt-12 md:px-8 md:pt-16 lg:px-12 [&>*]:shrink-0">
            <Box i={6} label="Status" className="h-8 w-[260px]" />
            <div className="relative w-full max-w-[350px] md:max-w-[740px] lg:max-w-[1180px]">
              <span className="bp-dim hidden md:block" style={{ "--i": 9 } as CSSProperties}>
                <span>1180</span>
              </span>
              <Box i={7} label="Title · 60 / 66" className="h-[120px] w-full md:h-[132px]" />
            </div>
            <Box i={8} label="Copy · 18 / 28" className="h-[78px] w-full max-w-[560px] md:h-14" />
            <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row md:gap-3">
              <Box i={9} label="CTA 01" className="h-12 md:w-[188px]" />
              <Box i={10} label="CTA 02" className="h-12 md:w-[146px]" />
            </div>
            <div className="-mx-5 mt-4 flex gap-3 self-stretch overflow-hidden md:-mx-8 md:mt-8 md:gap-4 lg:-mx-12">
              {plates.map((c) => (
                <Box key={c} i={11 + c} label={`Plate 0${c + 1}`} cross className="aspect-[448/344] w-[292px] shrink-0 md:w-[460px]" />
              ))}
            </div>
          </div>
        </div>

        <div className="bp__meta">
          <span>Aerobox · Sheet 01 · Home</span>
          <span className="bp__bar" />
        </div>
      </div>
    </>
  );
}
