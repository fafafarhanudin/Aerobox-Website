"use client";

import { useState, type ReactNode } from "react";

/* Selected work shows the portfolio first; case studies are one click away. */
export function WorkTabs({ portfolio, cases }: { portfolio: ReactNode; cases: ReactNode }) {
  const [tab, setTab] = useState<"portfolio" | "cases">("portfolio");
  const tabs = [
    ["portfolio", "Portfolio"],
    ["cases", "Case studies"],
  ] as const;
  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <div role="tablist" aria-label="Selected work" className="inline-flex self-start rounded-full border border-line bg-page p-1">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`flex h-10 items-center gap-2 rounded-full px-5 text-[15px] font-medium tracking-[-0.15px] transition-colors duration-200 ${
              tab === key ? "bg-white text-ink shadow-[0_1px_2px_rgba(12,14,20,.08),0_0_0_1px_rgba(12,14,20,.05)]" : "text-ink-3 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div key={tab} className="animate-[tab-in_.5s_cubic-bezier(.2,.8,.2,1)_both]">
        {tab === "portfolio" ? portfolio : cases}
      </div>
    </div>
  );
}
