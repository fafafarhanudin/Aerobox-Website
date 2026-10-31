import { Eyebrow } from "@/components/ui";
import { Animator } from "@/components/figures/animator";

/* The ten services, each drawn as a small machine whose working is the service (figures from
   scripts/figures/build.mjs). On phones the cards scroll sideways instead of stacking ten deep. */
const services = [
  { key: "W", figure: "web", title: "Websites", body: "Landing pages and marketing sites that convert." },
  { key: "A", figure: "product", title: "Web apps", body: "Product flows for SaaS and AI tools." },
  { key: "D", figure: "dashboard", title: "Dashboards", body: "Dense data that still reads at a glance." },
  { key: "M", figure: "mobile", title: "Mobile apps", body: "iOS and Android, from first flow to handoff." },
  { key: "B", figure: "brand", title: "Branding", body: "Identity systems that stay consistent everywhere." },
  { key: "L", figure: "logo", title: "Logo design", body: "Marks that work from 16px to a billboard." },
  { key: "I", figure: "illustration", title: "Illustration", body: "Custom spot art instead of stock." },
  { key: "N", figure: "animation", title: "Animation", body: "Motion for product demos and launches." },
  { key: "P", figure: "deck", title: "Pitch decks", body: "Decks that make the numbers clear." },
  { key: "F", figure: "nocode", title: "No-code development", body: "Framer sites I design, build and ship myself." },
];

export function Services() {
  return (
    <section
      id="services"
      className="flex scroll-mt-16 flex-col gap-8 border-b border-line py-14 md:gap-10 md:py-[72px] lg:py-24"
    >
      <div className="flex flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-8 lg:px-12">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="02" label="Services" count={services.length} />
          <h2 className="font-heading text-[30px] leading-[36px] tracking-[-0.72px] text-ink md:text-[36px] md:leading-[44px] lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            One partner,
            <br />
            <span className="text-ink-soft">ten disciplines.</span>
          </h2>
        </div>
        <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2 md:max-w-[336px] md:text-right lg:max-w-[456px]">
          From the first wireframe to the deck that raises the round. One designer, one Figma file, no agency hand-offs
          in between.
        </p>
      </div>

      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-8 md:pb-0 lg:grid-cols-5 lg:px-12">
        {services.map((s, i) => (
          <li key={s.title} className="flex w-[78%] shrink-0 snap-start flex-col gap-4 rounded-[20px] border border-line bg-white p-4 md:w-auto">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[16px] font-medium leading-6 tracking-[-0.16px] text-ink">{s.title}</h3>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase leading-4 tracking-[0.08em] text-ink-3">
                {String(i + 1).padStart(2, "0")}
                <span className="grid size-5 place-items-center rounded-[5px] border border-line bg-page text-[10px] text-ink-2 shadow-[0_1px_0_rgba(12,14,20,.06)]">
                  {s.key}
                </span>
              </span>
            </div>
            <Animator name={s.figure} ratio="340 / 230" theme="light" className="iso fig-card -mx-2" />
            <p className="text-[14px] leading-[22px] tracking-[-0.14px] text-ink-2">{s.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
