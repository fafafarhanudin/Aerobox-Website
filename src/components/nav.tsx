"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock } from "@untitled-ui/icons-react";
import { Brand, Key, SocialLogo } from "@/components/ui";
import { EmailKey } from "@/components/email-key";
import { LocalTime } from "@/components/local-time";
import { projects } from "@/data/projects";
import { site, socials, type SocialKey } from "@/lib/site";

const navSocials: SocialKey[] = ["x", "linkedin", "contra", "dribbble", "ondesign"];

const links = [
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

export function Nav() {
  const pathname = usePathname();
  const onWork = pathname.startsWith("/work");

  return (
    <header className="flex items-center justify-between border-y border-line px-5 py-4 md:px-6">
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

      <div className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2.5 pr-3 text-[12px] font-medium leading-4 tracking-[-0.12px]">
        <Clock width={14} height={14} strokeWidth={1.2} className="text-ink-2" aria-hidden="true" />
        <span className="text-ink">
          <span className="hidden min-[400px]:inline">Indonesia </span>
          <LocalTime />
        </span>
        <span className="text-ink-3">{site.timeZoneLabel}</span>
      </div>

      <div className="hidden items-center justify-end gap-4 md:flex">
        <span className="hidden text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-3 lg:inline">
          Other Portofolio
        </span>
        <div className="flex items-center gap-2">
          {navSocials.map((s) => (
            <Key key={s} href={socials[s].href} size="sm" aria-label={socials[s].label} capClassName="size-9">
              <SocialLogo name={s} size={20} />
            </Key>
          ))}
        </div>
        <span className="h-6 w-0.5 bg-line" aria-hidden="true" />
        <EmailKey
          label="Send email"
          variant="primary"
          size="sm"
          capClassName="gap-2.5 py-2 pl-3.5 pr-2.5 text-[14px] font-medium leading-5 tracking-[-0.14px]"
        />
      </div>
    </header>
  );
}
