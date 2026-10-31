import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FadeImage } from "@/components/work/fade-image";
import Image, { type ImageProps } from "next/image";
import { WorkCard } from "@/components/work/work-card";
import { TransitionLink } from "@/components/view-transition";
import { Key } from "@/components/ui";
import { pageMeta } from "@/lib/meta";
import { nextWork, workBySlug, works, type Shot } from "@/data/work";

const LeadOrFade = ({ lead, alt, ...props }: ImageProps & { lead: boolean }) => (lead ? <Image alt={alt} {...props} /> : <FadeImage alt={alt} {...props} />);

export const dynamicParams = false;
export const generateStaticParams = () => works.map((w) => ({ slug: w.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = workBySlug((await params).slug);
  if (!w) return {};
  const meta = pageMeta(w.name, `${w.summary}. ${w.overview}`.slice(0, 300), `/work/${w.slug}`);
  const image = { url: w.cover.src, width: w.cover.w, height: w.cover.h, alt: `${w.name} — ${w.cover.caption}` };
  return { ...meta, openGraph: { ...meta.openGraph, images: [image] }, twitter: { ...meta.twitter, images: [w.cover.src] } };
}

const pad = (n: number) => String(n).padStart(2, "0");
const label = "font-mono text-[11px] uppercase leading-4 tracking-[0.12em] text-ink-3";

/** consecutive shots with no caption continue the panel above them (a long page cut into parts) */
function panels(shots: Shot[]) {
  const out: Shot[][] = [];
  for (const s of shots) {
    if (!s.caption && out.length) out[out.length - 1].push(s);
    else out.push([s]);
  }
  return out;
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const w = workBySlug((await params).slug);
  if (!w) notFound();
  const next = nextWork(w.slug);
  const screens = w.sections.reduce((n, s) => n + s.shots.filter((x) => x.caption).length, 0) + w.more.length;
  let first = true;

  return (
    <article className="grid gap-10 border-b border-line px-5 pb-16 pt-8 md:px-8 md:pt-10 lg:grid-cols-[minmax(260px,320px)_1fr] lg:gap-14 lg:px-12 lg:pb-24">
      <aside className="flex flex-col gap-7 lg:sticky lg:top-24 lg:self-start">
        <TransitionLink href="/work" className={`${label} w-fit transition-colors hover:text-ink`}>
          ← All work
        </TransitionLink>
        <div className="flex flex-col gap-2">
          <p className={label}>{w.isCase ? "Case study" : w.category}</p>
          <h1 className="font-heading text-[34px] leading-[38px] tracking-[-0.68px] text-ink md:text-[44px] md:leading-[48px]">{w.name}</h1>
          <p className="text-[15px] leading-6 tracking-[-0.15px] text-ink-2">{w.summary}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className={label}>Overview</p>
          <p className="text-[15px] leading-[25px] tracking-[-0.15px] text-ink-2">{w.overview}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5">
          <div className="flex flex-col gap-1">
            <dt className={label}>Category</dt>
            <dd className="text-[14px] leading-5 text-ink">{w.category}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className={label}>Screens</dt>
            <dd className="text-[14px] leading-5 text-ink">{screens}</dd>
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <dt className={label}>Scope</dt>
            <dd className="flex flex-wrap gap-1.5">
              {w.scope.map((s) => (
                <span key={s} className="rounded-full border border-line bg-white px-2.5 py-1 font-mono text-[10px] uppercase leading-3 tracking-[0.08em] text-ink-2">
                  {s}
                </span>
              ))}
            </dd>
          </div>
        </dl>
        {w.url && (
          <Key href={w.url} variant="primary" className="w-fit" capClassName="h-11 gap-2 px-4 text-[15px] font-medium leading-5 tracking-[-0.15px]">
            Visit live site ↗
          </Key>
        )}
      </aside>

      <div className="flex min-w-0 flex-col gap-14 md:gap-20">
        {w.sections.map((s, si) => (
          <section key={si} className="flex flex-col gap-6">
            {s.title && (
              <header className="flex max-w-[640px] flex-col gap-2">
                <p className={label}>
                  {pad(si + 1)} · {s.title}
                </p>
                {s.body && <p className="text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">{s.body}</p>}
              </header>
            )}
            {panels(s.shots).map((group, gi) => {
              const lead = first;
              first = false;
              return (
                <figure key={gi} className="flex flex-col gap-3">
                  <figcaption className={label}>{group[0].caption}</figcaption>
                  <div
                    data-vt-lead={lead ? "" : undefined}
                    className="overflow-hidden rounded-[22px] border border-line bg-page p-[2.5%] md:p-[3.5%]"
                    style={lead ? ({ viewTransitionName: `work-${w.slug}`, viewTransitionClass: "shot" } as React.CSSProperties) : undefined}
                  >
                    <div className="overflow-hidden rounded-[10px] shadow-[0_0_0_1px_rgba(12,14,20,.06),0_30px_60px_-30px_rgba(12,14,20,.35)]">
                      {group.map((g) => (
                        // the lead screen is the page-transition target: shown at once, never faded in
                        <LeadOrFade
                          lead={lead}
                          key={g.src}
                          src={g.src}
                          alt={`${w.name} — ${g.caption || group[0].caption}`}
                          width={g.w}
                          height={g.h}
                          quality={90}
                          priority={lead}
                          sizes="(min-width: 1440px) 1000px, (min-width: 1024px) 70vw, 94vw"
                          className="block h-auto w-full"
                        />
                      ))}
                    </div>
                  </div>
                </figure>
              );
            })}
          </section>
        ))}

        {w.more.length > 0 && (
          <section className="flex flex-col gap-6">
            <p className={label}>More from {w.name}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {w.more.map((m) => (
                <figure key={m.src} className="flex flex-col gap-2">
                  <div className="overflow-hidden rounded-[16px] border border-line bg-page p-[4%]">
                    <FadeImage src={m.src} alt={`${w.name} — ${m.caption}`} width={m.w} height={m.h} quality={85} sizes="(min-width: 1024px) 480px, 94vw" className="block h-auto w-full rounded-[6px]" />
                  </div>
                  <figcaption className={label}>{m.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <nav aria-label="Next project" className="flex flex-col gap-4 border-t border-line pt-10">
          <p className={label}>Next project</p>
          <div className="max-w-[660px]">
            <WorkCard work={next} />
          </div>
        </nav>
      </div>
    </article>
  );
}
