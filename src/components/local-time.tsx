"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const format = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: site.timeZone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(format());
    const id = setInterval(() => setTime(format()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time suppressHydrationWarning className="tabular-nums">
      {time ?? "--:--"}
    </time>
  );
}
