"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Menu02, XClose } from "@untitled-ui/icons-react";
import { Brand, Key, SocialLogo } from "@/components/ui";
import { EmailKey } from "@/components/email-key";
import { LocalTime } from "@/components/local-time";
import { projects } from "@/data/projects";
import { site, socials, type SocialKey } from "@/lib/site";

const navSocials: SocialKey[] = ["x", "linkedin", "contra", "dribbble", "ondesign"];

const links = [
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Collection", href: "/#collection" },
  { label: "FAQ", href: "/#faq" },
  { label: "Support", href: "/support" },
];

const menuLinkCls =
  "flex items-center justify-between rounded-xl px-3 py-3 text-[16px] font-medium leading-6 tracking-[-0.16px] text-ink transition-colors duration-150 hover:bg-subtle";

export function Nav() {
  const pathname = usePathname();
  const onWork = pathname.startsWith("/work");
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1200 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-y border-line bg-white/95 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center justify-between gap-3 px-5 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-10 lg:gap-14">
        <Link href="/" aria-label="Aerobox home" className="rounded-lg">
          <Brand />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          <Link
            href="/work"
            aria-current={onWork ? "page" : undefined}
            className="-mx-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink transition-colors duration-150 hover:bg-subtle"
          >
            Portfolio
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[12px] leading-4 tracking-[-0.12px] text-accent">
              {projects.length}
            </span>
          </Link>
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="-mx-2 rounded-lg px-2 py-1 text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink-2 transition-colors duration-150 hover:bg-subtle hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-white py-1.5 pl-2.5 pr-3 text-[12px] font-medium leading-4 tracking-[-0.12px]">
        <Clock width={14} height={14} strokeWidth={1.2} className="text-ink-2" aria-hidden="true" />
        <span className="text-ink">
          <span className="hidden min-[560px]:inline max-xl:lg:hidden">Indonesia </span>
          <LocalTime />
        </span>
        <span className="hidden text-ink-3 min-[480px]:inline max-xl:lg:hidden">{site.timeZoneLabel}</span>
      </div>

      <div className="hidden items-center justify-end gap-4 md:flex">
        <span className="hidden whitespace-nowrap text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-3 xl:inline">
          Other Portofolio
        </span>
        <div className="hidden items-center gap-2 xl:flex">
          {navSocials.map((s) => (
            <Key key={s} href={socials[s].href} size="sm" aria-label={socials[s].label} capClassName="size-9">
              <SocialLogo name={s} size={20} />
            </Key>
          ))}
        </div>
        <span className="hidden h-6 w-0.5 bg-line xl:block" aria-hidden="true" />
        <EmailKey
          label="Send email"
          variant="primary"
          size="sm"
          capClassName="gap-2.5 py-2 pl-3.5 pr-2.5 text-[14px] font-medium leading-5 tracking-[-0.14px]"
        />
      </div>

      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-white text-ink transition-colors hover:bg-subtle lg:hidden"
      >
        {open ? <XClose width={20} height={20} strokeWidth={1.4} /> : <Menu02 width={20} height={20} strokeWidth={1.4} />}
      </button>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full flex max-h-[calc(100dvh-64px)] flex-col gap-5 overflow-y-auto border-b border-line bg-white px-5 pb-6 pt-3 shadow-[0_24px_48px_rgba(12,14,20,0.12)] md:px-6 lg:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            <Link href="/work" className={menuLinkCls} aria-current={onWork ? "page" : undefined}>
              Portfolio
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[12px] leading-4 tracking-[-0.12px] text-accent">
                {projects.length}
              </span>
            </Link>
            {links.map((l) => (
              <Link key={l.label} href={l.href} className={menuLinkCls} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {navSocials.map((s) => (
              <Key key={s} href={socials[s].href} size="sm" aria-label={socials[s].label} capClassName="size-10">
                <SocialLogo name={s} size={20} />
              </Key>
            ))}
          </div>
          <EmailKey
            label="Send email"
            variant="primary"
            className="w-full md:hidden"
            capClassName="h-12 w-full justify-center gap-2.5 text-[16px] font-medium leading-5 tracking-[-0.16px]"
          />
        </div>
      )}
    </header>
  );
}
