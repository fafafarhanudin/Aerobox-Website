import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";

const pad = (n: number) => String(n).padStart(2, "0");

export function MarqueeCard({
  title,
  tag,
  image,
  index,
  priority,
}: {
  title: string;
  tag: string;
  image: string;
  index: number;
  priority?: boolean;
}) {
  return (
    <Link
      href="/work"
      className="lift group relative flex w-[292px] shrink-0 flex-col rounded-lg border border-line bg-white p-1.5 md:w-[460px]"
    >
      <span className="relative block aspect-[448/320] w-full overflow-hidden rounded bg-subtle">
        <Image
          src={image}
          alt={`${title} — ${tag}`}
          fill
          sizes="(min-width: 810px) 448px, 280px"
          className="object-cover"
          priority={priority}
        />
        <ViewPill label="View project" />
      </span>
      <Caption title={title} tag={tag} right={pad(index)} />
    </Link>
  );
}

function ViewPill({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-ink/90 px-2.5 py-1 text-[12px] font-medium leading-4 tracking-[-0.12px] text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
      {label} ↗
    </span>
  );
}

function Caption({
  title,
  tag,
  right,
  badge,
  rightMuted = true,
}: {
  title: string;
  tag: string;
  right: string;
  badge?: React.ReactNode;
  rightMuted?: boolean;
}) {
  return (
    <span className="flex items-center justify-between gap-3 px-2 pb-1 pt-2.5">
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[14px] font-medium leading-5 tracking-[-0.14px] text-ink">{title}</span>
        <span className="hidden shrink-0 text-[12px] leading-4 tracking-[-0.12px] text-ink-2 sm:inline">{tag}</span>
        {badge}
      </span>
      <span
        className={`shrink-0 text-[12px] font-medium leading-4 tracking-[-0.12px] ${rightMuted ? "text-ink-3" : "text-ink-2"}`}
      >
        {right}
      </span>
    </span>
  );
}

export function WorkCard({ project, priority }: { project: Project; priority?: boolean }) {
  const isLive = project.category === "Live websites";
  const badge = project.live ? (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#e8f8ee] px-1.5 py-0.5 text-[10px] font-medium leading-3 tracking-[-0.1px] text-[#15803d]">
      <span className="size-1.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
      Live
    </span>
  ) : project.isNew ? (
    <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium leading-3 tracking-[-0.1px] text-accent">
      New
    </span>
  ) : null;

  const body = (
    <>
      <span
        className="relative block w-full overflow-hidden rounded bg-subtle"
        style={{ aspectRatio: `650 / ${project.height}` }}
      >
        <Image
          src={project.image}
          alt={`${project.title} — ${project.tag}`}
          fill
          sizes="(min-width: 1200px) 650px, (min-width: 810px) 46vw, 92vw"
          className="object-cover"
          priority={priority}
        />
        {!isLive && <ViewPill label="View project" />}
      </span>
      <Caption
        title={project.title}
        tag={project.tag}
        right={isLive ? "Visit ↗" : pad(project.index)}
        rightMuted={!isLive}
        badge={badge}
      />
    </>
  );

  const cls = "lift group flex w-full flex-col rounded-lg border border-line bg-white p-1.5";

  if (project.url) {
    return (
      <a href={project.url} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    );
  }
  return (
    <article className={cls} tabIndex={0} aria-label={`${project.title}, ${project.tag}`}>
      {body}
    </article>
  );
}
