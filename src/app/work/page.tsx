import type { Metadata } from "next";
import { WorkIndex } from "@/components/work/work-index";
import { Contact } from "@/components/sections/contact";
import { screenCount } from "@/data/work";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta(
  "All work",
  `All ${screenCount} works by Aerobox Design: dashboards, web apps, mobile apps and landing pages.`,
  "/work",
);

export default function WorkPage() {
  return (
    <>
      <WorkIndex />
      <Contact />
    </>
  );
}
