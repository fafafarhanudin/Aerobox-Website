import { DisciplineProvider } from "@/components/discipline";
import { Hero } from "@/components/sections/hero";
import { Clients } from "@/components/sections/clients";
import { SelectedWork } from "@/components/sections/selected-work";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { About } from "@/components/sections/about";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <DisciplineProvider>
      <Hero />
      <Clients />
      <SelectedWork />
      <Services />
      <Process />
      <About />
      <Testimonials />
      <Faq />
      <Contact />
    </DisciplineProvider>
  );
}
