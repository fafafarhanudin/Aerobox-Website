import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import { Eyebrow } from "@/components/ui";
import { SupportForm } from "@/components/support/support-form";
import { SupportWall } from "@/components/support/support-wall";
import { getWall } from "@/lib/support/db";
import { availability } from "@/lib/support/providers";

export const revalidate = 60;

export const metadata: Metadata = pageMeta(
  "Support Aerobox",
  "Every contribution helps us create more high-quality design resources for the creative community.",
  "/support",
);

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
      <section className={`border-b border-line py-12 md:py-16 lg:py-20 ${pad}`}>
        <div className="mx-auto flex w-full max-w-[920px] flex-col gap-8 md:gap-10">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="flex flex-col items-start gap-4">
              <Eyebrow label="Support" count="One-time · voluntary" />
              <h1 className="font-heading text-[34px] leading-[38px] tracking-[-1px] text-ink md:text-[48px] md:leading-[52px] md:tracking-[-1.44px]">
                Support Independent Creativity
              </h1>
            </div>
            <p className="max-w-[340px] text-[15px] leading-6 tracking-[-0.15px] text-ink-2">
              Every contribution helps us create more high-quality design resources for the creative community.
            </p>
          </div>
          <SupportForm available={availability()} />
        </div>
      </section>
      <SupportWall entries={wall} className={pad} />
    </>
  );
}
