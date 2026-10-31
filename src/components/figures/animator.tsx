"use client";

import { useEffect, useRef } from "react";

/* Moves the parts of a figure built by scripts/figures/build.mjs. Every moving group is a <g data-part>; its
   position is a world offset (x, y, z) turned into screen pixels with the axis vectors on the <svg> (data-u).
   Positions follow their targets with a critically damped spring, so every move starts and lands softly.
   Loops run only while the figure is on screen; reduced motion keeps the drawing still. */

type Channels = { x?: number; y?: number; z?: number; o?: number; s?: number; sy?: number };
type Pose = Record<string, Channels>;
type Key = [time: number, pose: Pose, snap?: boolean];
type Script = { period: number; keys: Key[] };

const tap = (at: number, scroll: number): Key[] => [
  [at, { tip: { z: -11 }, coilB: { sy: 1.5 }, coilF: { sy: 1.5 } }],
  [at + 0.25, { ripple: { o: 1, s: 3 } }],
  [at + 0.35, { tip: { z: 0 }, coilB: { sy: 1 }, coilF: { sy: 1 }, feed: { y: scroll } }],
  [at + 0.55, { ripple: { o: 0 } }],
  [at + 1.2, { ripple: { s: 1 } }, true],
];

const scripts: Record<string, Script> = {
  // the gantry picks a tile from the tray, sets it into the empty slot, and goes back for the next one
  product: {
    period: 7.2,
    keys: [
      [0, { x: { x: 0 }, z: { z: 0 }, pick: { o: 1 }, carry: { o: 0 }, placed: { o: 0 } }],
      [0.5, { z: { z: -14.6 } }],
      [1.3, { pick: { o: 0 }, carry: { o: 1 } }],
      [1.4, { z: { z: 0 } }],
      [2.1, { x: { x: 85 } }],
      [3.5, { z: { z: -16.8 } }],
      [4.3, { placed: { o: 1 }, carry: { o: 0 } }],
      [4.4, { z: { z: 0 } }],
      [5.1, { x: { x: 0 } }],
      [6.3, { placed: { o: 0 }, pick: { o: 1 } }],
    ],
  },
  // the key unlocks, the sections lift out, drop back in one by one, and the key locks them again
  web: {
    period: 7.4,
    keys: [
      [0, { keyA: { o: 1 }, keyB: { o: 0 }, b0: { z: 0, o: 1 }, b1: { z: 0, o: 1 }, b2: { z: 0, o: 1 }, b3: { z: 0, o: 1 } }],
      [1.6, { keyA: { o: 0 }, keyB: { o: 1 } }],
      [2.1, { b3: { z: 22, o: 0 }, b2: { z: 22, o: 0 } }],
      [2.25, { b1: { z: 22, o: 0 }, b0: { z: 22, o: 0 } }],
      [3.2, { b0: { z: 0, o: 1 } }],
      [3.8, { b1: { z: 0, o: 1 } }],
      [4.4, { b2: { z: 0, o: 1 } }],
      [5.0, { b3: { z: 0, o: 1 } }],
      [5.8, { keyA: { o: 1 }, keyB: { o: 0 } }],
    ],
  },
  // three taps, each scrolls the feed one card; then it scrolls back to the top
  mobile: {
    period: 6.6,
    keys: [
      [0, { tip: { z: 0 }, coilB: { sy: 1 }, coilF: { sy: 1 }, feed: { y: 0 }, ripple: { o: 0, s: 1 } }],
      ...tap(0.6, -20),
      ...tap(2.2, -40),
      ...tap(3.8, -60),
      [5.5, { feed: { y: 0 } }],
    ],
  },
  // the stamped card moves to the stack, a blank one slides in, the ram presses the mark onto it
  brand: {
    period: 6.4,
    keys: [
      [0, { card: { x: 0, z: 0, o: 1 }, mark: { o: 1 }, ram: { z: 0 } }],
      [0.9, { card: { x: 72, z: 0.6 } }],
      [2.0, { card: { o: 0 } }],
      [2.5, { card: { x: -70, z: 0 }, mark: { o: 0 } }, true],
      [2.7, { card: { o: 1 } }],
      [2.8, { card: { x: 0 } }],
      [4.1, { ram: { z: -16.8 } }],
      [4.5, { mark: { o: 1 } }],
      [4.6, { ram: { z: 0 } }],
    ],
  },
};

// matches STATIONS in scripts/figures/build.mjs
const STATION_STEP = 130;

/** Process: the shuttle drives to the active station first; on arrival that head lowers and the brief gains its layer. */
function processPose(stage: number, since: number): Pose {
  const arrived = since > 0.75;
  const done = arrived ? stage : stage - 1;
  const pose: Pose = { shuttle: { x: stage * STATION_STEP } };
  for (let i = 0; i < 4; i++) {
    pose[`tool${i}`] = { z: arrived && i === stage ? -8 : 0 };
    pose[`layer${i}`] = { o: i <= Math.max(0, done) ? 1 : 0 };
  }
  return pose;
}

function poseAt(script: Script, t: number) {
  const pose: Pose = {};
  let snap: Pose | null = null;
  for (const [time, step, jump] of script.keys) {
    if (time > t) break;
    for (const [name, channels] of Object.entries(step)) pose[name] = { ...pose[name], ...channels };
    if (jump) snap = step;
  }
  return { pose, snap };
}

type Live = { el: SVGGElement; anchor?: [number, number]; at: Required<Omit<Channels, "o">>; v: Required<Omit<Channels, "o">>; o: number };
const CHANNELS = ["x", "y", "z", "s", "sy"] as const;
const REST = { x: 0, y: 0, z: 0, s: 1, sy: 1 };
const W = 10; // spring stiffness: settles in about half a second

function animate(root: HTMLElement, svg: SVGSVGElement, name: string, stageRef: { current: { stage: number; since: number } }) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
    const u = (svg.dataset.u ?? "").split(" ").map(Number);
    const parts = new Map<string, Live>();
    svg.querySelectorAll<SVGGElement>("g[data-part]").forEach((el) => {
      const pin = el.dataset.anchor?.split(" ").map(Number) as [number, number] | undefined;
      parts.set(el.dataset.part ?? "", { el, anchor: pin, at: { ...REST }, v: { x: 0, y: 0, z: 0, s: 0, sy: 0 }, o: Number(el.style.opacity || 1) });
    });

    const draw = (p: Live) => {
      const { x, y, z, s, sy } = p.at;
      const sx = x * u[0] + y * u[2] + z * u[4];
      const sY = x * u[1] + y * u[3] + z * u[5];
      let transform = `translate(${sx.toFixed(2)} ${sY.toFixed(2)})`;
      if (p.anchor && (Math.abs(s - 1) > 1e-3 || Math.abs(sy - 1) > 1e-3)) {
        const [ax, ay] = p.anchor;
        transform += ` translate(${ax} ${ay}) scale(${s.toFixed(3)} ${(s * sy).toFixed(3)}) translate(${-ax} ${-ay})`;
      }
      p.el.setAttribute("transform", transform);
    };

    const script = scripts[name];
    let clock = 0;
    let last = 0;
    let raf = 0;
    let visible = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      stageRef.current.since += dt;
      const { pose, snap } = script ? poseAt(script, clock % script.period) : { pose: processPose(stageRef.current.stage, stageRef.current.since), snap: null };
      for (const [part, p] of parts) {
        const target = { ...REST, ...pose[part] };
        for (const c of CHANNELS) {
          if (snap?.[part] && snap[part][c] !== undefined) {
            p.at[c] = target[c];
            p.v[c] = 0;
            continue;
          }
          p.v[c] += (W * W * (target[c] - p.at[c]) - 2 * W * p.v[c]) * dt;
          p.at[c] += p.v[c] * dt;
        }
        draw(p);
        const o = pose[part]?.o;
        if (o !== undefined && o !== p.o) {
          p.o = o;
          p.el.style.opacity = String(o);
        }
      }
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "60px" },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
}

/** Loads /figures/<name>.svg (written by the build script) when the figure nears the viewport, then runs its motion.
    The box keeps the figure's aspect ratio, so nothing shifts when it arrives. */
export function Animator({
  name,
  ratio,
  stage = 0,
  theme,
  className = "",
  onReady,
}: {
  name: string;
  ratio: string;
  stage?: number;
  theme?: "light";
  className?: string;
  onReady?: (svg: SVGSVGElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef({ stage, since: 0 });
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  });
  useEffect(() => {
    stageRef.current = { stage, since: 0 };
  }, [stage]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let stop = () => {};
    let cancelled = false;
    const loader = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        loader.disconnect();
        fetch(`/figures/${name}.svg`)
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.statusText))))
          .then((markup) => {
            if (cancelled) return;
            root.innerHTML = markup;
            const svg = root.querySelector<SVGSVGElement>("svg[data-u]");
            if (!svg) return;
            readyRef.current?.(svg);
            stop = animate(root, svg, name, stageRef);
          })
          .catch(() => {});
      },
      { rootMargin: "600px" },
    );
    loader.observe(root);
    return () => {
      cancelled = true;
      loader.disconnect();
      stop();
    };
  }, [name]);

  return <div ref={ref} className={`fig-holder ${className}`} data-theme={theme} style={{ aspectRatio: ratio }} />;
}
