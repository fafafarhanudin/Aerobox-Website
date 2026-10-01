"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { FitToWidth } from "@/components/fit-to-width";

const U = 52;
const GAP = 6;
const ROW_UNITS = 14.5;
const BOARD_W = ROW_UNITS * (U + GAP) - GAP;
const MAX_CHARS = 52;

type Side = "left" | "right";
type K = {
  id: string;
  w?: number;
  char?: string;
  shifted?: string;
  label?: string;
  icon?: ReactNode;
  word?: string;
  side?: Side;
  codes?: string[];
};

const width = (units = 1) => Math.round(units * (U + GAP) - GAP);

const alpha = (s: string): K[] => s.split("").map((c) => ({ id: c, char: c, label: c }));
const dual = (pairs: [string, string][]): K[] => pairs.map(([base, shifted]) => ({ id: base, char: base, shifted }));

const Globe = (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M1.5 8h13M8 1.5c2 2.2 2 10.8 0 13M8 1.5c-2 2.2-2 10.8 0 13" />
  </svg>
);

const rows: K[][] = [
  [
    ...dual([["`", "~"], ["1", "!"], ["2", "@"], ["3", "#"], ["4", "$"], ["5", "%"], ["6", "^"], ["7", "&"], ["8", "*"], ["9", "("], ["0", ")"], ["-", "_"], ["=", "+"]]),
    { id: "delete", w: 1.5, word: "delete", icon: "⌫", side: "right", codes: ["Backspace"] },
  ],
  [
    { id: "tab", w: 1.5, word: "tab", icon: "⇥", side: "left", codes: ["Tab"] },
    ...alpha("QWERTYUIOP"),
    ...dual([["[", "{"], ["]", "}"], ["\\", "|"]]),
  ],
  [
    { id: "caps", w: 1.75, word: "caps lock", icon: "⇪", side: "left", codes: ["CapsLock"] },
    ...alpha("ASDFGHJKL"),
    ...dual([[";", ":"], ["'", '"']]),
    { id: "return", w: 1.75, word: "return", icon: "↩", side: "right", codes: ["Enter"] },
  ],
  [
    { id: "shiftL", w: 2.25, word: "shift", icon: "⇧", side: "left", codes: ["ShiftLeft"] },
    ...alpha("ZXCVBNM"),
    ...dual([[",", "<"], [".", ">"], ["/", "?"]]),
    { id: "shiftR", w: 2.25, word: "shift", icon: "⇧", side: "right", codes: ["ShiftRight"] },
  ],
  [
    { id: "fn", word: "fn", icon: Globe, side: "left" },
    { id: "ctrl", word: "control", icon: "⌃", side: "left", codes: ["ControlLeft", "ControlRight"] },
    { id: "optL", word: "option", icon: "⌥", side: "left", codes: ["AltLeft"] },
    { id: "cmdL", w: 1.25, word: "command", icon: "⌘", side: "left", codes: ["MetaLeft"] },
    { id: "space", w: 5, char: " ", codes: ["Space"] },
    { id: "cmdR", w: 1.25, word: "command", icon: "⌘", side: "right", codes: ["MetaRight"] },
    { id: "optR", word: "option", icon: "⌥", side: "right", codes: ["AltRight"] },
  ],
];

const arrows: K[] = [
  { id: "left", label: "◀", codes: ["ArrowLeft"] },
  { id: "up", label: "▲", codes: ["ArrowUp"] },
  { id: "down", label: "▼", codes: ["ArrowDown"] },
  { id: "right", label: "▶", codes: ["ArrowRight"] },
];

// Hue offset per key so the wave travels across the board.
const hueOffset = new Map<string, number>();
rows.forEach((row, r) => {
  let x = 0;
  for (const k of row) {
    const w = width(k.w);
    hueOffset.set(k.id, Math.round(((x + w / 2) / BOARD_W) * 300 + r * 14));
    x += w + GAP;
  }
});
arrows.forEach((k, i) => hueOffset.set(k.id, Math.round(((BOARD_W - (3 - Math.min(i, 2)) * (U + GAP) + U / 2) / BOARD_W) * 300 + 56)));

const byCode = new Map<string, string>();
for (const k of [...rows.flat(), ...arrows]) for (const c of k.codes ?? []) byCode.set(c, k.id);
const byShifted = new Map<string, string>();
for (const k of rows.flat()) if (k.shifted) byShifted.set(k.shifted, k.id);

const keyIdFromEvent = (e: KeyboardEvent) => {
  const mapped = byCode.get(e.code);
  if (mapped) return mapped;
  if (e.key.length !== 1) return null;
  return byShifted.get(e.key) ?? e.key.toUpperCase();
};

export const lightingModes = [
  { id: "wave", label: "Wave", swatch: "conic-gradient(from 90deg, #ff7a7a, #ffd37a, #8ef0a6, #7ac8ff, #b48cff, #ff7a7a)" },
  { id: "breathe", label: "Breathe", swatch: "linear-gradient(135deg, #7aa8ff, #c08cff)" },
  { id: "aurora", label: "Aurora", swatch: "linear-gradient(135deg, #6fe3d2, #6f8bff 60%, #a77bff)" },
  { id: "ice", label: "Ice", hue: 205 },
  { id: "lilac", label: "Lilac", hue: 268 },
  { id: "mint", label: "Mint", hue: 158 },
  { id: "peach", label: "Peach", hue: 22 },
  { id: "off", label: "Off", swatch: "linear-gradient(135deg, #f4f4f6, #cfd1d7)" },
] as const;

type ModeId = (typeof lightingModes)[number]["id"];
const STORAGE_KEY = "aerobox-kb-lighting";

function Keycap({
  k,
  down,
  on,
  onPress,
  half,
}: {
  k: K;
  down: boolean;
  on?: boolean;
  onPress: (k: K) => void;
  half?: "top" | "bottom";
}) {
  const kind = k.word ? "mod" : k.shifted ? "dual" : k.label ? "alpha" : "blank";
  return (
    <button
      type="button"
      onClick={() => onPress(k)}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={k.word ?? k.label ?? (k.id === "space" ? "space" : k.char)}
      aria-pressed={on}
      data-pressed={down || undefined}
      data-on={on || undefined}
      data-half={half}
      className="kk"
      style={{ width: width(k.w), "--o": hueOffset.get(k.id) } as CSSProperties}
    >
      <span className={`kk__face kk__face--${kind} ${k.side === "right" ? "kk__face--right" : ""}`}>
        {kind === "alpha" && <span className="kk__main">{k.label}</span>}
        {kind === "dual" && (
          <>
            <span className="kk__sub">{k.shifted}</span>
            <span className="kk__main kk__main--sm">{k.char}</span>
          </>
        )}
        {kind === "mod" && (
          <>
            <span className="kk__icon">{k.icon}</span>
            <span className="kk__word">{k.word}</span>
          </>
        )}
        {k.id === "caps" && <span className="kk__led" aria-hidden="true" />}
      </span>
    </button>
  );
}

export function MiniKeyboard() {
  const [text, setText] = useState("");
  const [caps, setCaps] = useState(false);
  const [shift, setShift] = useState(false);
  const [down, setDown] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);
  const [mode, setMode] = useState<ModeId>("wave");
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as ModeId | null;
      if (saved && lightingModes.some((m) => m.id === saved)) setMode(saved);
    } catch {}
  }, []);

  const chooseMode = (id: ModeId) => {
    setMode(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  const pressVisual = useCallback((id: string) => {
    setDown(id);
    window.setTimeout(() => setDown((d) => (d === id ? null : d)), 150);
  }, []);

  const type = useCallback((s: string) => setText((t) => (t + s).slice(-MAX_CHARS)), []);
  const clear = useCallback(() => {
    setText("");
    setFlash((f) => f + 1);
  }, []);

  const onVirtualKey = (k: K) => {
    pressVisual(k.id);
    if (k.id === "delete") return setText((t) => t.slice(0, -1));
    if (k.id === "return") return clear();
    if (k.id === "caps") return setCaps((c) => !c);
    if (k.id === "shiftL" || k.id === "shiftR") return setShift((s) => !s);
    if (k.id === "tab") return type(" ");
    if (!k.char) return;
    if (k.shifted) type(shift ? k.shifted : k.char);
    else type(/[A-Z]/.test(k.char) && caps === shift ? k.char.toLowerCase() : k.char);
    if (shift) setShift(false);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const onKey = (e: KeyboardEvent) => {
      if (!visible.current || e.metaKey || e.ctrlKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const id = keyIdFromEvent(e);
      if (id) pressVisual(id);
      if (e.repeat && e.key !== "Backspace") return;
      if (e.key === "Backspace") setText((s) => s.slice(0, -1));
      else if (e.key === "Enter") clear();
      else if (e.key === "CapsLock") setCaps(e.getModifierState("CapsLock"));
      else if (e.key.length === 1) {
        if (e.key === " ") e.preventDefault();
        type(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [clear, pressVisual, type]);

  const current = lightingModes.find((m) => m.id === mode)!;
  const staticHue = "hue" in current ? current.hue : undefined;

  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-5">
      <div className="kb rgb-board w-full" data-mode={staticHue !== undefined ? "static" : mode} style={{ "--kb-static": staticHue } as CSSProperties}>
        <div key={flash} className="kb-screen mx-auto w-full" style={{ maxWidth: BOARD_W + 50 }} aria-live="polite" aria-label="Typed text">
          <span className="kb-screen__led" aria-hidden="true" />
          <span className="kb-screen__text">
            {text ? (
              text.split("").map((c, i) => (
                <span key={`${i}-${text.length}`} className={i === text.length - 1 ? "kb-char-in" : undefined}>
                  {c === " " ? " " : c}
                </span>
              ))
            ) : (
              <span className="text-ink-3">Start typing…</span>
            )}
            <span className="kb-caret" aria-hidden="true" />
          </span>
          <span className="kb-screen__meta">
            {text.length.toString().padStart(2, "0")}/{MAX_CHARS}
          </span>
        </div>

        <FitToWidth className="mt-3 pb-4">
          <div className="relative p-2">
            <span className="kb-underglow" aria-hidden="true" />
            <div className="kb-case" role="group" aria-label="Keyboard playground">
              <div className="kb-tray" style={{ width: BOARD_W }}>
                {rows.map((row, r) => (
                  <div key={r} className="flex items-end" style={{ gap: GAP }}>
                    {row.map((k) => (
                      <Keycap
                        key={k.id}
                        k={k}
                        down={down === k.id}
                        on={k.id === "caps" ? caps : k.id.startsWith("shift") ? shift : undefined}
                        onPress={onVirtualKey}
                      />
                    ))}
                    {r === rows.length - 1 && (
                      <div className="flex items-end" style={{ gap: GAP }}>
                        <Keycap k={arrows[0]} down={down === "left"} onPress={onVirtualKey} half="bottom" />
                        <div className="flex flex-col" style={{ gap: 2 }}>
                          <Keycap k={arrows[1]} down={down === "up"} onPress={onVirtualKey} half="top" />
                          <Keycap k={arrows[2]} down={down === "down"} onPress={onVirtualKey} half="bottom" />
                        </div>
                        <Keycap k={arrows[3]} down={down === "right"} onPress={onVirtualKey} half="bottom" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FitToWidth>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="kb-modes" role="radiogroup" aria-label="Keyboard lighting">
          {lightingModes.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              aria-label={m.label}
              title={m.label}
              onClick={() => chooseMode(m.id)}
              className="kb-mode"
              style={{ background: "swatch" in m ? m.swatch : `hsl(${m.hue} 78% 66%)` }}
            />
          ))}
        </div>
        <p className="text-center font-mono text-[11px] uppercase leading-4 tracking-[0.14em] text-ink-3">
          Lighting <span className="text-ink-2">{current.label}</span>
          <span className="hidden md:inline"> · type on it or use your own keyboard</span>
        </p>
      </div>
    </div>
  );
}
