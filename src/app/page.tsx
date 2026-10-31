import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Clients } from "@/components/sections/clients";
import { SelectedWork } from "@/components/sections/selected-work";
import { Collection } from "@/components/sections/collection";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { About } from "@/components/sections/about";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/", siteName: "Aerobox", type: "website", title: "Aerobox — Design engineering by Farhan", description: "Farhan designs and builds websites, dashboards, mobile apps and brands for SaaS, AI, B2B and Web3 teams." } };

export default function Home() {
  return (
    <>
      <Hero />
      <Clients />
      <SelectedWork />
      <Services />
      <Process />
      <About />
      <Testimonials />
      <Collection />
      <Faq />
      <Contact />
    </>
  );
}
