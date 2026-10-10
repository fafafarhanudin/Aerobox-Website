import { Eyebrow } from "@/components/ui";
import type { WallEntry } from "@/lib/support/db";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Jakarta" });

export function SupportWall({ entries, className = "" }: { entries: WallEntry[]; className?: string }) {
  return (
    <section id="wall" className={`flex scroll-mt-16 flex-col gap-8 border-b border-line py-14 md:py-[72px] lg:py-20 ${className}`}>
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow label="Support Wall" count={entries.length ? `${entries.length} supporters` : undefined} />
          <h2 className="font-heading text-[30px] leading-[36px] tracking-[-0.72px] text-ink md:text-[40px] md:leading-[48px]">
            Thank you, supporters
          </h2>
        </div>
        <p className="max-w-[380px] text-[14px] leading-[22px] tracking-[-0.14px] text-ink-2">
          Only confirmed payments appear here, and only the parts each supporter chose to make public.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-line px-6 py-10 md:items-center md:text-center">
          <p className="text-[16px] font-medium tracking-[-0.16px] text-ink">The wall is waiting for its first name.</p>
          <p className="text-[14px] leading-[22px] text-ink-2">Contributions show up here once the payment provider confirms them.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[15px] font-medium tracking-[-0.15px] text-ink">{e.name ?? "Anonymous"}</span>
                {e.amount && <span className="shrink-0 font-mono text-[12px] text-ink-2">{e.amount}</span>}
              </div>
              {e.message && <p className="break-words text-[14px] leading-[22px] tracking-[-0.14px] text-ink-2">“{e.message}”</p>}
              <span className="mt-auto font-mono text-[11px] text-ink-3">{fmtDate(e.paidAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
