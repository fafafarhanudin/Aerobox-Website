"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { FitToWidth } from "@/components/fit-to-width";

type K = { id: string; label: string; w?: number; codes?: string[]; char?: string };

const BOARD_W = 690;
const MAX_CHARS = 44;

const keysOf = (s: string): K[] => s.split("").map((c) => ({ id: c, label: c, char: c }));

const rows: K[][] = [
  [{ id: "`", label: "`", char: "`" }, ...keysOf("1234567890-="), { id: "delete", label: "delete", w: 84, codes: ["Backspace"] }],
  [{ id: "tab", label: "tab", w: 62, codes: ["Tab"] }, ...keysOf("QWERTYUIOP[]"), { id: "\\", label: "\\", w: 62, char: "\\" }],
  [{ id: "caps", label: "caps", w: 74, codes: ["CapsLock"] }, ...keysOf("ASDFGHJKL;'"), { id: "return", label: "return", w: 94, codes: ["Enter"] }],
  [{ id: "shiftL", label: "shift", w: 96, codes: ["ShiftLeft"] }, ...keysOf("ZXCVBNM,./"), { id: "shiftR", label: "shift", w: 116, codes: ["ShiftRight"] }],
  [
    { id: "fn", label: "fn" },
    { id: "ctrl", label: "ctrl", codes: ["ControlLeft", "ControlRight"] },
    { id: "optL", label: "opt", codes: ["AltLeft"] },
    { id: "cmdL", label: "cmd", w: 52, codes: ["MetaLeft"] },
    { id: "space", label: "", w: 236, codes: ["Space"], char: " " },
    { id: "cmdR", label: "cmd", w: 52, codes: ["MetaRight"] },
    { id: "optR", label: "opt", codes: ["AltRight"] },
    { id: "left", label: "←", codes: ["ArrowLeft"] },
    { id: "updown", label: "↑↓", codes: ["ArrowUp", "ArrowDown"] },
    { id: "right", label: "→", codes: ["ArrowRight"] },
  ],
];

// Hue offset per key so the colour cycle reads as a wave travelling across the board.
const hueOffset = new Map<string, number>();
rows.forEach((row, r) => {
  let x = 0;
  for (const k of row) {
    const w = k.w ?? 40;
    hueOffset.set(k.id, Math.round(((x + w / 2) / BOARD_W) * 300 + r * 18));
    x += w + 4;
  }
});

const byCode = new Map<string, string>();
for (const row of rows) for (const k of row) for (const c of k.codes ?? []) byCode.set(c, k.id);

const shiftedToBase: Record<string, string> = {
  "~": "`", "!": "1", "@": "2", "#": "3", $: "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
  _: "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", '"': "'", "<": ",", ">": ".", "?": "/",
};

const keyIdFromEvent = (e: KeyboardEvent) => {
  const mapped = byCode.get(e.code);
  if (mapped) return mapped;
  if (e.key.length !== 1) return null;
  const ch = e.key.toUpperCase();
  return shiftedToBase[ch] ?? ch;
};

export function MiniKeyboard() {
  const [text, setText] = useState("");
  const [caps, setCaps] = useState(false);
  const [shift, setShift] = useState(false);
  const [down, setDown] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  const pressVisual = useCallback((id: string) => {
    setDown(id);
    window.setTimeout(() => setDown((d) => (d === id ? null : d)), 140);
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
    const upper = caps !== shift;
    type(/[A-Z]/.test(k.char) && !upper ? k.char.toLowerCase() : k.char);
    if (shift) setShift(false);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting), { threshold: 0.4 });
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

  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-4">
      <FitToWidth>
        <div className="rgb-board flex w-[690px] flex-col gap-3">
          <div key={flash} className="kb-screen" aria-live="polite" aria-label="Typed text">
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
            <span className="kb-screen__meta">{text.length.toString().padStart(2, "0")}/{MAX_CHARS}</span>
          </div>

          <div className="relative">
            <span className="rgb-underglow" aria-hidden="true" />
            <div className="plate relative flex flex-col gap-1.5 rounded-[20px] p-4" role="group" aria-label="Keyboard playground">
              {rows.map((row, r) => (
                <div key={r} className="flex items-end gap-1">
                  {row.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => onVirtualKey(k)}
                      aria-label={k.label || "space"}
                      aria-pressed={k.id === "caps" ? caps : k.id.startsWith("shift") ? shift : undefined}
                      data-pressed={down === k.id || undefined}
                      data-on={(k.id === "caps" && caps) || (k.id.startsWith("shift") && shift) || undefined}
                      className="mini-key"
                      style={{ width: k.w ?? 40, "--o": hueOffset.get(k.id) } as CSSProperties}
                    >
                      <span className="mini-key__cap">{k.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </FitToWidth>
      <p className="flex items-center gap-2.5 text-[12px] font-medium leading-4 text-ink-3">
        <span className="rgb-dot" aria-hidden="true" />
        Type on it — or use your own keyboard. Return clears the line.
      </p>
    </div>
  );
}
