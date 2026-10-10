"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@untitled-ui/icons-react";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`key key--sm fixed bottom-4 right-4 z-40 transition-[opacity,translate] duration-300 md:bottom-6 md:right-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span className="key__cap gap-2 px-3 py-2 text-[14px] font-medium leading-5 tracking-[-0.14px]">
        <ArrowUp width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        <span className="hidden md:inline">Back to top</span>
        <span className="md:hidden">Top</span>
      </span>
    </button>
  );
}
