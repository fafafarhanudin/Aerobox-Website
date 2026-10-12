import type { Metadata } from "next";
import { CornerDownLeft } from "@/components/aero-icons";
import { Eyebrow, Key, Legend } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-8 border-b border-line px-5 py-20 text-center md:px-8">
      <div className="flex flex-col items-center gap-4">
        <Eyebrow index="404" label="Not found" />
        <h1 className="font-heading text-[34px] leading-[40px] tracking-[-0.34px] text-ink md:text-[56px] md:leading-[60px]">
          This page took a wrong turn.
          <br />
          <span className="text-ink-soft">Let&apos;s get you back.</span>
        </h1>
      </div>
      <p className="max-w-[440px] text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">
        The link may be old or mistyped. Have a look at the work, or send a message if you were looking for something specific.
      </p>
      <div className="flex w-full flex-col items-stretch gap-2.5 md:w-auto md:flex-row md:items-end md:gap-3">
        <Key href="/" variant="primary" capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]">
          Back to home
          <Legend>
            <CornerDownLeft width={12} height={12} strokeWidth={1.8} />
          </Legend>
        </Key>
        <Key href="/work" capClassName="h-12 px-[18px] text-[16px] font-medium leading-5 tracking-[-0.16px]">
          View all work
        </Key>
        <Key href={site.telegram} capClassName="h-12 px-[18px] text-[16px] font-medium leading-5 tracking-[-0.16px]">
          Send a message
        </Key>
      </div>
    </section>
  );
}
