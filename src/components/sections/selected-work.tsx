import { Grid01 } from "@untitled-ui/icons-react";
import { Chip, Key, Legend, chipIcon } from "@/components/ui";
import { Marquee } from "@/components/marquee";
import { MarqueeCard } from "@/components/project-card";
import { projects, selectedWork } from "@/data/projects";

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
          <Chip icon={<Grid01 {...chipIcon} />} label="Portfolio" count={projects.length} />
          <h2 className="font-heading text-[36px] leading-[44px] tracking-[-0.72px] text-ink lg:text-[44px] lg:leading-[52px] lg:tracking-[-0.88px]">
            Selected work
          </h2>
          <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">
            {selectedWork.length} hand-picked works on a slow loop. All {projects.length} works are one click away.
          </p>
        </div>
        <div className="hidden lg:block">{viewAll}</div>
      </div>

      <Marquee label="Selected work" duration={400} fade="w-[72px] md:w-40" className="w-full">
        {selectedWork.map((w, i) => (
          <div key={`${w.image}-${i}`} className="pr-3 md:pr-4">
            <MarqueeCard {...w} priority={i < 3} />
          </div>
        ))}
      </Marquee>

      <div className="flex justify-center px-5 md:px-0 lg:hidden">{viewAll}</div>
    </section>
  );
}
