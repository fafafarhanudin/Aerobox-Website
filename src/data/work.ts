import { projects, type Category } from "@/data/projects";
import { notes } from "@/data/case-notes";
import sizes from "@/data/image-sizes.json";

/**
 * Projects as the site shows them: every screen in data/projects.ts grouped by product name
 * ("BetFlow · Markets" → BetFlow), plus four case studies with screens exported from Figma at 1.6×.
 * Words live in data/case-notes.ts.
 */

export type Shot = { src: string; w: number; h: number; caption: string };
export type Section = { title: string; body?: string; shots: Shot[]; tall?: boolean };

export type Work = {
  slug: string;
  name: string;
  category: Category;
  summary: string;
  overview: string;
  scope: string[];
  cover: Shot;
  /** case study chapters; plain projects have one untitled chapter */
  sections: Section[];
  /** screens from the catalogue that are not already in a chapter */
  more: Shot[];
  isCase: boolean;
  isNew: boolean;
  url?: string;
  live?: boolean;
};

const sizeMap: Record<string, number[]> = sizes;
const size = (src: string): [number, number] => {
  const s = sizeMap[src];
  return s ? [s[0], s[1]] : [1600, 1100];
};
const shot = (src: string, caption: string): Shot => {
  const [w, h] = size(src);
  return { src, w, h, caption };
};
const cs = (slug: string, file: string, caption: string) => shot(`/work/cases/${slug}/${file}.webp`, caption);

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// the product a catalogue screen belongs to; Modelgate screens are the Handgate product
const productOf = (title: string) => {
  const name = title.split(" · ")[0].trim();
  return name === "Modelgate" ? "Handgate" : name;
};

type CaseDef = { slug: string; name: string; category: Category; url?: string; live?: boolean; sections: Section[] };

const caseStudies: CaseDef[] = [
  {
    slug: "cutmage",
    name: "Cutmage",
    category: "Dashboards",
    sections: [
      {
        title: "Home & projects",
        body: "A home that starts with what is rendering, waiting for review or due today, and a project library that reads like a media shelf.",
        shots: [cs("cutmage", "home", "Home · today at a glance"), cs("cutmage", "projects", "Projects · media library")],
      },
      {
        title: "The editor",
        body: "Timeline, canvas and inspector in one dark frame. Color grading and keyframe curves open inside the same layout instead of new windows.",
        shots: [
          cs("cutmage", "editor", "Editor · timeline and canvas"),
          cs("cutmage", "color", "Editor · color grading"),
          cs("cutmage", "keyframe", "Editor · keyframe graph"),
        ],
      },
      {
        title: "Review & export",
        body: "Frame-accurate comments with approval states, then export presets for every channel with a live render queue.",
        shots: [cs("cutmage", "review", "Review · comments and approvals"), cs("cutmage", "export", "Export · presets and destinations")],
      },
      {
        title: "Insights & speed",
        body: "Performance per video and channel, and a command palette that reaches any project, clip or setting from the keyboard.",
        shots: [cs("cutmage", "analytics", "Analytics · views and retention"), cs("cutmage", "palette", "Command palette")],
      },
      {
        title: "Brand",
        body: "The identity the product ships with: logo, app icon, colour and type, applied across product and marketing.",
        shots: [cs("cutmage", "brand", "Brand · identity board")],
      },
    ],
  },
  {
    slug: "handgate",
    name: "Handgate",
    category: "Dashboards",
    sections: [
      {
        title: "Monitor",
        body: "The overview answers one question first: is traffic healthy right now. Live traffic adds the map and per-region latency.",
        shots: [cs("handgate", "overview", "Overview · requests, latency, spend"), cs("handgate", "live", "Live traffic · global map")],
      },
      {
        title: "Models & routing",
        body: "Pick models by price and latency, watch provider health, and route requests with rules that read like sentences.",
        shots: [
          cs("handgate", "models", "Models · catalogue and latency"),
          cs("handgate", "providers", "Providers · uptime"),
          cs("handgate", "routing", "Routing · rules and fallbacks"),
        ],
      },
      {
        title: "Investigate",
        body: "Request logs with a detail drawer that shows the full trace, cost and timeline of a single call.",
        shots: [cs("handgate", "logs", "Logs · request trace")],
      },
      {
        title: "Spend & build",
        body: "Costs by model and project with budgets, a playground to compare models side by side, and API keys with scopes.",
        shots: [cs("handgate", "costs", "Costs · budgets"), cs("handgate", "playground", "Playground"), cs("handgate", "keys", "API keys")],
      },
    ],
  },
  {
    slug: "marshal",
    name: "Marshal",
    category: "Dashboards",
    sections: [
      {
        title: "Operations",
        body: "The shift starts on one overview: active consists, departures, alerts and yard capacity.",
        shots: [cs("marshal", "home", "Operations overview")],
      },
      {
        title: "Consist planning",
        body: "Build a train wagon by wagon. Isometric renders, weights and checks update as the consist changes.",
        shots: [cs("marshal", "consist", "Consist planner · MC-4827")],
        tall: true,
      },
      {
        title: "Yard & cargo",
        body: "Track-by-track yard inventory and a cargo manifest with dangerous-goods flags and documents.",
        shots: [cs("marshal", "yard", "Yard inventory · North Yard"), cs("marshal", "cargo", "Cargo manifest")],
      },
      {
        title: "Routes & line control",
        body: "Schedules on a time grid and a line diagram with signals, points and train positions.",
        shots: [cs("marshal", "routes", "Routes & schedules"), cs("marshal", "line", "Line control")],
      },
      {
        title: "Fleet & reports",
        body: "Maintenance work orders, rolling stock in 3D, and utilization reports for the depot.",
        shots: [cs("marshal", "fleet", "Fleet maintenance"), cs("marshal", "rolling", "Rolling stock"), cs("marshal", "reports", "Reports · last 30 days")],
      },
    ],
  },
  {
    slug: "sentinel-ai",
    name: "Sentinel AI",
    category: "Landing pages",
    sections: [
      {
        title: "Landing page",
        body: "The full page, top to bottom: from the promise to the platform, pricing and the closing call to action.",
        shots: [1, 2, 3, 4, 5].map((i) => cs("sentinel-ai", `landing-${i}`, i === 1 ? "Landing page · full length" : "")),
        tall: true,
      },
      {
        title: "Product story",
        body: "Four steps, each with its own illustration: connect, analyze, observe, act.",
        shots: [
          cs("sentinel-ai", "shot-1", "Step 01 · Connect"),
          cs("sentinel-ai", "shot-2", "Step 02 · Analyze"),
          cs("sentinel-ai", "shot-3", "Step 03 · Observe"),
          cs("sentinel-ai", "shot-4", "Step 04 · Act"),
        ],
      },
    ],
  },
];

// ---------- assemble ----------

// Bento cards and live client websites are not shown as portfolio work
const SHOWN: Category[] = ["Dashboards", "Web apps", "Mobile apps", "Landing pages"];
const portfolio = projects.filter((p) => SHOWN.includes(p.category));

const groups = new Map<string, typeof projects>();
for (const p of portfolio) {
  const name = productOf(p.title);
  groups.set(name, [...(groups.get(name) ?? []), p]);
}

const captionOf = (title: string, fallback: string) => (title.includes(" · ") ? title.split(" · ").slice(1).join(" · ") : fallback);

function build(): Work[] {
  const out: Work[] = [];
  for (const def of caseStudies) {
    const note = notes[def.name];
    const catalogue = (groups.get(def.name) ?? []).map((p) => shot(p.image, captionOf(p.title, p.tag)));
    out.push({
      slug: def.slug,
      name: def.name,
      category: def.category,
      summary: note.summary,
      overview: note.overview,
      scope: note.scope ?? [],
      cover: def.sections[0].shots[0],
      sections: def.sections,
      more: catalogue,
      isCase: true,
      isNew: true,
      url: def.url,
      live: def.live,
    });
  }
  const taken = new Set(caseStudies.map((c) => c.name));
  for (const [name, items] of groups) {
    if (taken.has(name)) continue;
    const first = items[0];
    const note = notes[name] ?? { summary: first.tag, overview: `${name}, ${first.tag.toLowerCase()} design.` };
    const shots = items.map((p, i) => shot(p.image, items.length > 1 ? captionOf(p.title, `${p.tag} ${i + 1}`) : captionOf(p.title, p.tag)));
    out.push({
      slug: slugify(name),
      name,
      category: first.category,
      summary: note.summary,
      overview: note.overview,
      scope: note.scope ?? [first.tag],
      cover: shots[0],
      sections: [{ title: "", shots }],
      more: [],
      isCase: false,
      isNew: items.some((p) => p.isNew),
      url: first.url,
      live: first.live,
    });
  }
  return out;
}

export const works: Work[] = build();
export const workBySlug = (slug: string) => works.find((w) => w.slug === slug);
export const caseStudyCount = caseStudies.length;
export const nextWork = (slug: string) => {
  const i = works.findIndex((w) => w.slug === slug);
  return works[(i + 1) % works.length];
};

/** the six on the home page: the case studies first, then two strong dashboards */
export const featured = ["cutmage", "handgate", "marshal", "sentinel-ai", "aether-ai", "kargo"]
  .map((s) => workBySlug(s))
  .filter((w): w is Work => Boolean(w));

export const workCategories: { name: Category | "Case studies"; count: number }[] = [
  { name: "Case studies", count: caseStudies.length },
  ...SHOWN.map((name) => ({ name, count: portfolio.filter((p) => p.category === name).length })),
];

/** the hero wall: fifteen strong screens, each linking to its project, in column order */
const WALL = [
  "Cutmage · Home", "Lintas · Control room", "Stride", "Modelgate · Models", "Kargo",
  "Trading terminal", "Aperture redesign", "Aether AI · Charging ledger", "Sentinel AI", "Flowdesk",
  "Cutmage · Editor", "Analytics suite", "Moolah", "Crypto portfolio", "Developer console",
];
export const heroWall = WALL.map((title) => {
  const p = projects.find((x) => x.title === title)!;
  const product = productOf(p.title);
  const work = works.find((w) => w.name === product)!;
  return { shot: shot(p.image, p.title), slug: work.slug, name: product, tag: p.tag };
});

/** every portfolio piece on its own, in catalogue order, each opening the project it belongs to (the /work grid) */
const caseNames = new Set(caseStudies.map((c) => c.name));
export const screens = portfolio.map((p) => {
  const product = productOf(p.title);
  const work = works.find((w) => w.name === product)!;
  return { ...shot(p.image, p.title), title: p.title, tag: p.tag, category: p.category, slug: work.slug, isNew: !!p.isNew, isCase: caseNames.has(product) };
});
export const screenCount = screens.length;
