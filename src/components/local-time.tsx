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
