"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function FitToWidth({
  children,
  minScale = 0,
  className = "",
}: {
  children: ReactNode;
  minScale?: number;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const centered = useRef(false);
  const [box, setBox] = useState<{ scale: number; w?: number; h?: number; overflow: boolean }>({
    scale: 1,
    overflow: false,
  });

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const w = i.offsetWidth;
      const h = i.offsetHeight;
      if (!w || !o.clientWidth) return;
      const fit = o.clientWidth / w;
      const scale = Math.min(1, Math.max(minScale, fit));
      setBox({ scale, w: w * scale, h: h * scale, overflow: fit < minScale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [minScale]);

  useLayoutEffect(() => {
    const o = outer.current;
    if (!o || !box.overflow || centered.current) return;
    o.scrollLeft = (o.scrollWidth - o.clientWidth) / 2;
    centered.current = true;
  }, [box.overflow]);

  return (
    <div
      ref={outer}
      className={`w-full ${box.overflow ? "overflow-x-auto overscroll-x-contain [scrollbar-width:none]" : ""} ${className}`}
    >
      <div className="relative mx-auto" style={{ width: box.w, height: box.h }}>
        <div
          ref={inner}
          className={`${box.w === undefined ? "relative" : "absolute"} left-0 top-0 w-max`}
          style={{ transform: `scale(${box.scale})`, transformOrigin: "0 0" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
