"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps } from "react";

/* Shared-element page transitions with the View Transitions API. On click a project card's panel takes
   view-transition-name "work-<slug>"; the first image on that project's page has the same name, so the
   card grows into the page. Browsers without the API, modifier clicks and reduced motion get a plain navigation. */

let finish: (() => void) | null = null;

export function TransitionLink({ href, onClick, ...rest }: ComponentProps<typeof Link>) {
  const router = useRouter();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!("startViewTransition" in document) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const url = typeof href === "string" ? href : (href.pathname ?? "/");
        if (url === location.pathname) return;
        e.preventDefault();
        // only the clicked card takes part, so the browser snapshots one panel, not the whole grid
        const panel = e.currentTarget.querySelector<HTMLElement>("[data-vt-name]");
        if (panel) {
          panel.style.setProperty("view-transition-name", panel.dataset.vtName ?? "");
          panel.style.setProperty("view-transition-class", "shot");
        }
        document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              finish = resolve;
              router.push(url);
              window.setTimeout(resolve, 1200); // never hold the page hostage
            }),
        );
      }}
    />
  );
}

/** Mounted once in the layout: ends the pending transition once the new page has painted its lead image. */
export function ViewTransitionDone() {
  const pathname = usePathname();
  useEffect(() => {
    const done = finish;
    if (!done) return;
    finish = null;
    // no requestAnimationFrame here: rendering is paused while the transition waits, so frames never come
    const img = document.querySelector<HTMLImageElement>("[data-vt-lead] img");
    if (img) {
      img.decode().then(done, done);
      window.setTimeout(done, 450);
    } else done();
  }, [pathname]);
  return null;
}
