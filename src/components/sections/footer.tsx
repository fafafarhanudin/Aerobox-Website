"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "@untitled-ui/icons-react";
import { Brand, SocialLogo } from "@/components/ui";
import { LocalTime } from "@/components/local-time";
import { MiniKeyboard } from "@/components/mini-keyboard";
import { mailtoHref } from "@/components/email-key";
import { site, socials, type SocialKey } from "@/lib/site";

const sitemap = [
  { label: "Portfolio", href: "/work" },
  { label: "Services", href: "/#services" },
  { label: "Process", href: "/#process" },
  { label: "About", href: "/#about" },
  { label: "FAQ", href: "/#faq" },
];

const connect: SocialKey[] = ["x", "linkedin", "dribbble", "behance", "contra", "ondesign", "upwork"];

const colTitle = "text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-3";
const linkCls =
  "text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink underline-offset-4 transition-colors duration-150 hover:text-ink-2";

function Status() {
  return (
    <div className="flex items-center gap-2">
      <a
        href={socials.x.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Farhan on X"
        className="size-[30px] shrink-0 rounded-full border border-line bg-white p-px"
      >
        <Image src="/assets/hero/avatar.png" alt="" width={56} height={56} className="size-full rounded-full object-cover" />
      </a>
      <span className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2.5 pr-3 text-[12px] font-medium leading-4 tracking-[-0.12px] text-ink-2">
        <Image src="/assets/hero/dot.svg" alt="" width={8} height={8} />
        {site.availability}
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="flex flex-col gap-12 px-5 pb-12 pt-14 md:px-8 md:pt-16 lg:flex-row lg:justify-between lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:flex-col lg:items-start lg:justify-start">
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Aerobox home" className="self-start rounded-lg">
              <Brand />
            </Link>
            <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">
              Interfaces that feel obvious on first use.
              <br />
              Designed in Indonesia, shipped worldwide.
            </p>
          </div>
          <Status />
        </div>

        <div className="grid grid-cols-3 gap-8 md:flex md:justify-between lg:gap-16">
          <nav aria-label="Sitemap" className="flex flex-col gap-3">
            <p className={colTitle}>Sitemap</p>
            {sitemap.map((l) => (
              <Link key={l.label} href={l.href} className={linkCls}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <p className={colTitle}>Connect</p>
            {connect.map((s) => (
              <a key={s} href={socials[s].href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${linkCls}`}>
                <SocialLogo name={s} size={16} />
                {socials[s].label}
              </a>
            ))}
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <p className={colTitle}>Contact</p>
            <a href={site.telegram} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-0.5">
              <span className={linkCls}>Telegram</span>
              <span className="text-[12px] leading-4 tracking-[-0.12px] text-ink-2">{site.telegramHandle}</span>
            </a>
            <a href={mailtoHref} className="group flex min-w-0 flex-col gap-0.5">
              <span className={linkCls}>Email</span>
              <span className="break-all text-[12px] leading-4 tracking-[-0.12px] text-ink-2">{site.email}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="px-5 pb-12 pt-4 md:px-8 lg:px-12">
        <MiniKeyboard />
      </div>

      <div className="flex items-center justify-center border-t border-line px-5 py-5 md:justify-between md:px-8 lg:px-12">
        <p className="text-[14px] leading-5 tracking-[-0.14px] text-ink-2">© 2026 Aerobox Design. All rights reserved.</p>
        <div className="hidden items-center gap-4 md:flex">
          <p className="text-[14px] leading-5 tracking-[-0.14px] text-ink-2">
            Local time in Indonesia <LocalTime /> {site.timeZoneLabel}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="key key--sm"
          >
            <span className="key__cap gap-2 px-3 py-2 text-[14px] font-medium leading-5 tracking-[-0.14px]">
              <ArrowUp width={14} height={14} strokeWidth={1.2} aria-hidden="true" />
              Back to top
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
