"use client";


import { Eyebrow } from "@/components/ui";
import { disciplines, useDiscipline } from "@/components/discipline";

export function Services() {
  const { active, setActive } = useDiscipline();

  return (
    <section
      id="services"
      className="flex scroll-mt-4 flex-col gap-8 border-b border-line px-5 py-14 md:gap-10 md:px-8 md:py-[72px] lg:px-[clamp(48px,8.33vw,120px)] lg:py-20"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col items-start gap-4">
          <Eyebrow index="02" label="Services" count={disciplines.length} />
          <h2 className="font-heading text-[30px] leading-[36px] md:text-[36px] md:leading-[44px] tracking-[-0.72px] text-ink lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            One partner,
            <br />
            ten disciplines
          </h2>
        </div>
        <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2 md:max-w-[336px] md:text-right lg:max-w-[456px]">
          From the first wireframe to the deck that raises the round. One designer, one Figma file, no agency hand-offs
          in between.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-x-7 min-[560px]:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-3">
        {disciplines.map((d, i) => {
          const on = active === d.id;
          return (
            <li key={d.id} className="flex items-start gap-4 py-5 pr-4" onPointerEnter={() => setActive(d.id)}>
              <span className={`key key--sm ${on ? "key--primary" : ""}`} aria-hidden="true" style={{ cursor: "default" }}>
                <span className="key__cap size-9 text-[14px] font-medium leading-5 tracking-[-0.14px]">{i + 1}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-[18px] font-medium leading-[26px] tracking-[-0.18px] text-ink">{d.title}</span>
                <span
                  className={`text-[14px] leading-5 tracking-[-0.14px] transition-colors duration-150 ${on ? "text-ink" : "text-ink-2"}`}
                >
                  {d.body}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
