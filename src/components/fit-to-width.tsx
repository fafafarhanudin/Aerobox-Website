"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function FitToWidth({ children, className = "" }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ scale: number; height?: number }>({ scale: 1 });

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const scale = Math.min(1, o.clientWidth / i.scrollWidth);
      setBox({ scale, height: i.offsetHeight * scale });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className={`flex w-full items-start justify-center ${className}`} style={{ height: box.height }}>
      <div ref={inner} className="w-max shrink-0 origin-top" style={{ transform: `scale(${box.scale})` }}>
        {children}
      </div>
    </div>
  );
}
