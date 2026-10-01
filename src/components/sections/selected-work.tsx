
import { Eyebrow, Key, Legend } from "@/components/ui";
import { Marquee } from "@/components/marquee";
import { MarqueeCard } from "@/components/project-card";
import { projects, selectedWork } from "@/data/projects";

const half = Math.ceil(selectedWork.length / 2);
const rows = [selectedWork.slice(0, half), selectedWork.slice(half)];

export function SelectedWork() {
  const viewAll = (
    <Key
      href="/work"
      variant="primary"
      className="w-full md:w-auto"
      capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]"
    >
      View all {projects.length} works
      <Legend>A</Legend>
    </Key>
  );

  return (
    <section
      id="work"
      className="flex flex-col gap-8 border-b border-line py-14 md:gap-10 md:px-8 md:py-[72px] lg:px-0 lg:py-20"
    >
      <div className="flex items-end justify-between px-5 md:px-0 lg:px-[clamp(48px,8.33vw,120px)]">
        <div className="flex flex-col items-start gap-3">
          <Eyebrow index="01" label="Portfolio" count={projects.length} />
          <h2 className="font-heading text-[36px] leading-[44px] tracking-[-0.72px] text-ink lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            Selected work
          </h2>
          <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">
            {selectedWork.length} hand-picked works on a slow loop. All {projects.length} works are one click away.
          </p>
        </div>
        <div className="hidden lg:block">{viewAll}</div>
      </div>

      <div className="flex flex-col gap-1.5 md:gap-2">
        {rows.map((row, r) => (
          <Marquee
            key={r}
            label={r === 0 ? "Selected work" : "More selected work"}
            duration={row.length * 7.5}
            direction={r === 0 ? "left" : "right"}
            fade="w-[72px] md:w-40"
            className="w-full"
          >
            {row.map((w, i) => (
              <div key={`${w.image}-${i}`} className="pb-1.5 pr-3 pt-1 md:pr-4">
                <MarqueeCard {...w} priority={r === 0 && i < 3} />
              </div>
            ))}
          </Marquee>
        ))}
      </div>

      <div className="flex justify-center px-5 md:px-0 lg:hidden">{viewAll}</div>
    </section>
  );
}
