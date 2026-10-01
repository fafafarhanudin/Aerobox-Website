import Image from "next/image";
import { Briefcase01, User01 } from "@untitled-ui/icons-react";
import { Chip, Key, SocialLogo, chipIcon } from "@/components/ui";
import { socials, type SocialKey } from "@/lib/site";

const stats = [
  { value: "3+", label: "years designing products" },
  { value: "60+", label: "clients worldwide" },
  { value: "$20m+", label: "generated for clients" },
];

const findMe: SocialKey[] = ["x", "linkedin", "dribbble", "behance", "contra", "ondesign", "upwork"];

type Role = {
  company: string;
  logo: React.ReactNode;
  role: string;
  dates: string;
  place: string;
  current?: boolean;
};

const img = (src: string, w: number, h: number, alt: string) => (
  <Image src={src} alt={alt} width={w} height={h} className="shrink-0" style={{ width: w, height: h }} />
);

const roles: Role[] = [
  {
    company: "Keitoto Studio",
    logo: (
      <span className="flex items-center gap-[7px]" role="img" aria-label="Keitoto">
        <span className="relative size-[18px] rounded-full border-[2.15px] border-black">
          <Image src="/assets/about/keitoto-mark.svg" alt="" width={8} height={8} className="absolute left-[1.2px] top-[0.9px] size-[7.6px]" />
        </span>
        {img("/assets/about/keitoto-word.svg", 55, 18, "")}
      </span>
    ),
    role: "UI/UX Designer",
    dates: "Dec 2023 — Present",
    place: "On-site",
    current: true,
  },
  { company: "Kree8", logo: img("/assets/about/kree8.svg", 57, 18, "Kree8"), role: "UI/UX Designer", dates: "Dec 2023 — Present", place: "Remote", current: true },
  { company: "Exalt Studio", logo: img("/assets/about/exalt.svg", 80, 18, "Exalt Studio"), role: "Product Designer", dates: "Apr 2025 — Feb 2026", place: "Bath, UK · Remote" },
  { company: "Drewl", logo: img("/assets/about/drewl.svg", 61, 18, "Drewl"), role: "UI/UX Designer", dates: "Mar 2025 — Feb 2026", place: "London, UK · Remote" },
  { company: "Amply", logo: img("/assets/about/amply.png", 68, 20, "Amply"), role: "UI Designer · Freelance", dates: "Oct 2024 — Feb 2025", place: "Utah, US · Remote" },
  { company: "Berachain", logo: img("/assets/about/berachain.png", 103, 22, "Berachain"), role: "UI/UX & Product Designer", dates: "Jul 2024 — Jun 2025", place: "Remote" },
];

function Led({ on }: { on?: boolean }) {
  return on ? (
    <Image src="/assets/about/led-on.svg" alt="Current role" width={24} height={24} className="-m-2 size-6 shrink-0" />
  ) : (
    <Image src="/assets/about/led-off.svg" alt="" width={8} height={8} className="size-2 shrink-0" />
  );
}

export function About() {
  return (
    <section
      id="about"
      className="flex scroll-mt-4 flex-col gap-8 border-b border-line px-5 py-14 md:gap-10 md:px-8 md:py-[72px] lg:gap-14 lg:px-[clamp(48px,8.33vw,120px)] lg:py-24"
    >
      <div className="about-grid">
        <div className="[grid-area:chip]">
          <Chip icon={<User01 {...chipIcon} />} label="About" />
        </div>

        <figure className="flex flex-col rounded-[20px] border border-line bg-white p-2 [grid-area:portrait] lg:h-[453px]">
          <div className="relative aspect-[318/290] w-full overflow-hidden rounded-[14px] lg:aspect-auto lg:flex-1">
            <Image
              src="/assets/hero/avatar.png"
              alt="Farhan, founder of Aerobox Design"
              fill
              sizes="(min-width: 1200px) 30vw, 45vw"
              className="object-cover"
            />
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-x-2 px-2 pb-1.5 pt-3.5">
            <span className="text-[13px] font-medium leading-6 tracking-[-0.16px] text-ink md:text-[16px]">Farhan</span>
            <span className="text-[10px] leading-5 tracking-[-0.14px] text-ink-2 md:text-[14px]">Founder, Aerobox Design</span>
          </figcaption>
        </figure>

        <dl className="flex flex-col justify-center gap-5 [grid-area:stats] lg:flex-row lg:justify-start">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-1 lg:w-[232px]">
              <dt className="text-[12px] leading-5 tracking-[-0.14px] text-ink-2 md:text-[14px]">{s.label}</dt>
              <dd className="font-heading text-[28px] leading-8 tracking-[-0.56px] text-ink md:text-[48px] md:leading-[56px] md:tracking-[-0.96px]">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="text-[14px] leading-[1.4] tracking-[-0.18px] text-[#727272] [grid-area:statement] md:text-[18px]">
          Im <span className="text-black">Farhan</span> as a founder <span className="text-black">Aerobox Design</span>, ,
          a UI/UX Designer with over 3 years of experience. I specialize in creating clean, responsive, and user-centric
          interfaces for websites, dashboards, and mobile apps. My expertise lies in SaaS platforms, Web3 projects, B2B,
          Marketplaces, and product based solutions, always with a strong attention to detail and a commitment to
          improving the user experience. I&apos;ve collaborated with over 60 clients worldwide, helping them transform
          their ideas into intuitive digital products that not only look sleek and clean but also function seamlessly
          across a variety of devices.
        </p>

        <div className="flex flex-col gap-4 [grid-area:social]">
          <p className="text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink-2">Find me on</p>
          <ul className="flex flex-wrap gap-2.5">
            {findMe.map((s) => (
              <li key={s}>
                <Key
                  href={socials[s].href}
                  size="sm"
                  aria-label={s === "x" ? "X" : undefined}
                  capClassName={`gap-2 py-2 text-[14px] font-medium leading-5 tracking-[-0.14px] ${s === "x" ? "px-2.5" : "pl-2.5 pr-3.5"}`}
                >
                  <SocialLogo name={s} size={18} tone="light" />
                  {s !== "x" && socials[s].label}
                </Key>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <Chip icon={<Briefcase01 {...chipIcon} />} label="Experience" count={`${roles.length} roles`} />
          <p className="text-[14px] leading-5 tracking-[-0.14px] text-ink-2">Six teams since 2023</p>
        </div>
        <ul
          className="plate grid grid-cols-1 gap-3 rounded-[28px] p-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-6"
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,.05), 0 24px 48px rgba(12,14,20,.12), inset 0 1px 0 #fff" }}
        >
          {roles.map((r) => (
            <li key={r.company} className="key key--lg w-full" style={{ cursor: "default" }}>
              <span className="key__cap h-[116px] flex-col items-stretch justify-between px-[18px] pb-3.5 pt-4">
                <span className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                    {r.logo}
                    <span className="size-[3px] rounded-full bg-ink-3" aria-hidden="true" />
                    <span className="text-[13px] leading-[18px] tracking-[-0.13px] text-ink-2">{r.role}</span>
                  </span>
                  <Led on={r.current} />
                </span>
                <span className="flex items-center justify-between gap-2 text-[12px] leading-4">
                  <span className={`font-mono ${r.current ? "text-ink" : "text-ink-2"}`}>{r.dates}</span>
                  <span className="text-right tracking-[-0.12px] text-ink-3">{r.place}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
