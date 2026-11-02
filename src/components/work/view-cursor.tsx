"use client";

import { useRef, type ReactNode } from "react";

/* The preview hover from dhikaendi.com: a white "View" disc follows the pointer over a card's image and the
   screen eases up a little. Pointer-only; touch and reduced motion just get the plain card. */
export function ViewCursor({ label = "View", className = "", children }: { label?: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--vx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--vy", `${e.clientY - r.top}px`);
  };
  return (
    <span ref={ref} onPointerMove={move} onPointerEnter={move} className={`view-cursor ${className}`}>
      {children}
      <span className="view-cursor__disc" aria-hidden="true">
        {label}
      </span>
    </span>
  );
}
