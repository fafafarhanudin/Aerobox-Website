import type { Metadata } from "next";
import { WorkIndex } from "@/components/work/work-index";
import { Contact } from "@/components/sections/contact";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "All work",
  description: `All ${projects.length} works by Aerobox Design — dashboards, web apps, mobile apps, landing pages and live client websites.`,
};

export default function WorkPage() {
  return (
    <>
      <WorkIndex />
      <Contact />
    </>
  );
}
