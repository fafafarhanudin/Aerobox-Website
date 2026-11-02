import { Eyebrow, Key, Legend } from "@/components/ui";
import { WorkCard } from "@/components/work/work-card";
import { PortfolioCard, type PortfolioShot } from "@/components/work/portfolio-card";
import { WorkTabs } from "@/components/sections/work-tabs";
import { featured, screenCount } from "@/data/work";
import sizes from "@/data/image-sizes.json";

// dashboards from the Figma portfolio board (test-belajar-ai, node 3276:17522)
const sizeMap: Record<string, number[]> = sizes;
const portfolio: PortfolioShot[] = [
  ["trackline", "Trackline", "Project management dashboard"],
  ["nezuko", "Nezuko", "Sales and orders overview"],
  ["axentra", "Axentra", "Team task board"],
  ["visiora", "Visiora", "Social commerce analytics"],
  ["findjobs", "Find.Jobs", "Job search for designers"],
  ["incmax", "Incmax", "Team chat with AI suggestions"],
  ["affinetes", "Affinetes", "AI evaluation console"],
  ["filenns", "Filenns", "File storage with AI tags"],
].map(([file, name, summary]) => {
  const src = `/work/portfolio/${file}.webp`;
  const [w, h] = sizeMap[src] ?? [2160, 1536];
  return { name, summary, src, w, h };
});

export function SelectedWork() {
  const viewAll = (
    <Key
      href="/work"
      variant="primary"
      className="w-full md:w-auto"
      capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]"
    >
      View all {screenCount} works
      <Legend>A</Legend>
    </Key>
  );

  return (
    <section id="work" className="flex scroll-mt-16 flex-col gap-10 border-b border-line px-5 py-14 md:px-8 md:py-[72px] lg:px-12 lg:py-24">
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col items-start gap-3">
          <Eyebrow index="01" label="Selected work" count={screenCount} />
          <h2 className="font-heading text-[30px] leading-[36px] tracking-[-0.72px] text-ink md:text-[36px] md:leading-[44px] lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            Products and websites, <span className="text-ink-soft">shipped.</span>
          </h2>
          <p className="max-w-[560px] text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">
            Recent dashboards first, or switch to the case studies to see whole projects screen by screen.
          </p>
        </div>
        <div className="hidden lg:block">{viewAll}</div>
      </div>

      <WorkTabs
        portfolio={
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 md:gap-y-12">
            {portfolio.map((shot, i) => (
              <PortfolioCard key={shot.src} shot={shot} priority={i < 2} />
            ))}
          </div>
        }
        cases={
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 md:gap-y-12">
            {featured.map((w) => (
              <WorkCard key={w.slug} work={w} />
            ))}
          </div>
        }
      />

      <div className="flex justify-center lg:hidden">{viewAll}</div>
    </section>
  );
}
