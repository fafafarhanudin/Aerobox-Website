import { Eyebrow } from "@/components/ui";
import { Animator } from "@/components/figures/animator";

/* Four services, each drawn as a small machine whose working is the service: a gantry setting a component into a
   layout, a printer's chase locking page sections, a probe tapping a phone, a press stamping a mark. */
const services = [
  {
    figure: "product",
    title: "Product design",
    body: "Dashboards and web apps for SaaS, AI and Web3 teams, from user flows and wireframes to a Figma file your engineers can build from.",
    tags: ["Dashboards", "Web apps", "User flows", "Design systems", "Prototypes"],
  },
  {
    figure: "web",
    title: "Websites",
    body: "Marketing sites and landing pages that explain the product in one scroll, designed for every screen and handed off or built in Framer.",
    tags: ["Landing pages", "Marketing sites", "Framer", "Responsive"],
  },
  {
    figure: "mobile",
    title: "Mobile apps",
    body: "iOS and Android apps with flows checked on real screen sizes, components shared with the web product, and clickable prototypes.",
    tags: ["iOS", "Android", "App flows", "Prototypes"],
  },
  {
    figure: "brand",
    title: "Brand & motion",
    body: "Logos and identity systems, illustration and product animation, and the pitch deck that puts it all in front of investors.",
    tags: ["Logo", "Identity", "Illustration", "Animation", "Pitch decks"],
  },
] as const;

export function Services() {
  return (
    <section
      id="services"
      className="flex scroll-mt-16 flex-col gap-8 border-b border-line px-5 py-14 md:gap-10 md:px-8 md:py-[72px] lg:px-12 lg:py-24"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="02" label="Services" count={services.length} />
          <h2 className="font-heading text-[30px] leading-[36px] tracking-[-0.72px] text-ink md:text-[36px] md:leading-[44px] lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            What I design, <span className="text-ink-soft">start to finish.</span>
          </h2>
        </div>
        <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2 md:max-w-[336px] md:text-right lg:max-w-[456px]">
          One designer across product, web, mobile and brand, so everything you ship speaks with the same voice.
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-5 rounded-[20px] border border-line bg-white p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[18px] font-medium leading-[26px] tracking-[-0.18px] text-ink">{s.title}</h3>
              <span className="font-mono text-[10px] uppercase leading-3 tracking-[0.08em] text-ink-3">Fig. 0{i + 1}</span>
            </div>
            <Animator name={s.figure} ratio="340 / 230" theme="light" className="iso fig-card -mx-2" />
            <p className="text-[14px] leading-[22px] tracking-[-0.14px] text-ink-2">{s.body}</p>
            <ul className="mt-auto flex flex-wrap gap-1.5" aria-label={`${s.title} includes`}>
              {s.tags.map((t) => (
                <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase leading-3 tracking-[0.06em] text-ink-2">
                  {t}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
