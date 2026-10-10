"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: site.timeZone,
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: site.timeZone, weekday: "short", month: "short", day: "numeric" });
const clockFmt = new Intl.DateTimeFormat("en-US", { timeZone: site.timeZone, hour: "2-digit", minute: "2-digit", hour12: true });

/** "Jakarta · GMT+7 / Sat, Oct 10 / 01:02 PM" — the zone label and date drop away on narrow screens. */
export function LocalClock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: number;
    // Minute precision: wake on each minute boundary.
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 20);
    };
    tick();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const sep = <span className="px-1.5 text-ink-3/60" aria-hidden="true">/</span>;
  return (
    <span suppressHydrationWarning className={`whitespace-nowrap tabular-nums ${className}`}>
      <span className="hidden min-[560px]:inline">
        {site.city} · {site.timeZoneLabel}
        {sep}
      </span>
      <span className="hidden min-[420px]:inline">
        {now ? dateFmt.format(now) : "---, --- --"}
        {sep}
      </span>
      <time>{now ? clockFmt.format(now) : "--:-- --"}</time>
    </span>
  );
}

export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;
    // Re-arm on each tick so updates land on the second boundary instead of drifting.
    const tick = () => {
      setTime(formatter.format(new Date()));
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <time suppressHydrationWarning className="tabular-nums">
      {time ?? "--:--:-- --"}
    </time>
  );
}
