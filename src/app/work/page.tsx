import type { Metadata } from "next";
import { WorkIndex } from "@/components/work/work-index";
import { Contact } from "@/components/sections/contact";
import { projects } from "@/data/projects";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta(
  "All work",
  `All ${projects.length} works by Aerobox Design — dashboards, web apps, mobile apps, landing pages and live client websites.`,
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
