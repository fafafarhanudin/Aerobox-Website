import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { SupportForm } from "@/components/support/support-form";
import { SupportWall } from "@/components/support/support-wall";
import { getWall } from "@/lib/support/db";
import { availability } from "@/lib/support/providers";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Support Aerobox",
  description: "Every contribution helps us create more high-quality design resources for the creative community.",
};

async function loadWall() {
  try {
    return await getWall();
  } catch {
    return [];
  }
}

const pad = "px-5 md:px-8 lg:px-[clamp(48px,8.33vw,120px)]";

export default async function SupportPage() {
  const wall = await loadWall();
  return (
    <>
      <section className={`grid gap-10 border-b border-line py-14 md:py-[72px] lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16 lg:py-24 ${pad}`}>
        <div className="flex flex-col items-start gap-6 lg:sticky lg:top-28 lg:self-start">
          <Eyebrow label="Support" count="One-time · voluntary" />
          <h1 className="font-heading text-[40px] leading-[44px] tracking-[-1.2px] text-ink md:text-[56px] md:leading-[60px] md:tracking-[-1.68px]">
            Support Independent Creativity
          </h1>
          <p className="max-w-[460px] text-[17px] leading-[28px] tracking-[-0.17px] text-ink-2">
            Every contribution helps us create more high-quality design resources for the creative community.
          </p>
          <ol className="mt-2 flex w-full max-w-[460px] flex-col divide-y divide-line border-y border-line text-[14px] leading-5 tracking-[-0.14px]">
            {[
              ["Choose your region", "Rupiah for Indonesia, US dollars everywhere else."],
              ["Pick an amount", "Any amount helps. Nothing recurring, nothing to sign up for."],
              ["Pay on a secure checkout", "Card and wallet details are handled by the payment provider, never by us."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4 py-4">
                <span className="font-mono text-[12px] leading-5 text-ink-3">0{i + 1}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium text-ink">{t}</span>
                  <span className="text-ink-2">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <SupportForm available={availability()} />
      </section>
      <SupportWall entries={wall} className={pad} />
    </>
  );
}
