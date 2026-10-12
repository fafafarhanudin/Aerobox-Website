"use client";

import Script from "next/script";
import { useEffect } from "react";

/** GA4, off until NEXT_PUBLIC_GA_ID is set (Vercel → Settings → Environment Variables). Besides page views it
 *  records the contact clicks that matter: Telegram, email and profile links, each with where it was clicked. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Gtag = (...args: unknown[]) => void;

function eventFor(href: string): string | null {
  if (href.includes("t.me/")) return "contact_telegram";
  if (href.startsWith("mailto:")) return "contact_email";
  if (/upwork\.com|contra\.com|linkedin\.com|dribbble\.com|behance\.net|on\.design|x\.com\//.test(href)) return "profile_click";
  return null;
}

export function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const name = a && eventFor(a.href);
      const gtag = (window as unknown as { gtag?: Gtag }).gtag;
      if (!a || !name || !gtag) return;
      gtag("event", name, {
        link_url: a.href,
        link_text: (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 60),
        section: a.closest("section[id], header, footer")?.id || a.closest("header, footer")?.tagName.toLowerCase() || "page",
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
