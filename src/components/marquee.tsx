import type { CSSProperties, ReactNode } from "react";

export function Marquee({
  children,
  duration,
  direction = "left",
  fade,
  className = "",
  trackClassName = "",
  label,
}: {
  children: ReactNode;
  duration: number;
  direction?: "left" | "right";
  fade: string;
  className?: string;
  trackClassName?: string;
  label: string;
}) {
  return (
    <div className={`marquee ${className}`} role="region" aria-label={label}>
      <div
        className={`marquee__track ${trackClassName}`}
        data-direction={direction}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true" inert>
          {children}
        </div>
      </div>
      <span className={`fade-l ${fade}`} aria-hidden="true" />
      <span className={`fade-r ${fade}`} aria-hidden="true" />
    </div>
  );
}
