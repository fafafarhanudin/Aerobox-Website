"use client";

import { useEffect, useRef, useState } from "react";
import { FitToWidth } from "@/components/fit-to-width";

const colors = ["off", "blue", "green", "orange", "pink"] as const;
type Color = (typeof colors)[number];

type K = { id: string; label: string; w?: number; codes?: string[] };

const rows: K[][] = [
  [
    { id: "`", label: "`" }, ..."1234567890-=".split("").map((c) => ({ id: c, label: c })),
    { id: "delete", label: "delete", w: 84, codes: ["Backspace"] },
  ],
  [
    { id: "tab", label: "tab", w: 62, codes: ["Tab"] }, ..."QWERTYUIOP[]".split("").map((c) => ({ id: c, label: c })),
    { id: "\\", label: "\\", w: 62 },
  ],
  [
    { id: "caps", label: "caps", w: 74, codes: ["CapsLock"] }, ..."ASDFGHJKL;'".split("").map((c) => ({ id: c, label: c })),
    { id: "return", label: "return", w: 94, codes: ["Enter"] },
  ],
  [
    { id: "shiftL", label: "shift", w: 96, codes: ["ShiftLeft"] }, ..."ZXCVBNM,./".split("").map((c) => ({ id: c, label: c })),
    { id: "shiftR", label: "shift", w: 116, codes: ["ShiftRight"] },
  ],
  [
    { id: "fn", label: "fn" },
    { id: "ctrl", label: "ctrl", codes: ["ControlLeft", "ControlRight"] },
    { id: "optL", label: "opt", codes: ["AltLeft"] },
    { id: "cmdL", label: "cmd", w: 52, codes: ["MetaLeft"] },
    { id: "space", label: "", w: 236, codes: ["Space"] },
    { id: "cmdR", label: "cmd", w: 52, codes: ["MetaRight"] },
    { id: "optR", label: "opt", codes: ["AltRight"] },
    { id: "left", label: "←", codes: ["ArrowLeft"] },
    { id: "updown", label: "↑↓", codes: ["ArrowUp", "ArrowDown"] },
    { id: "right", label: "→", codes: ["ArrowRight"] },
  ],
];

const byCode = new Map<string, string>();
for (const row of rows) for (const k of row) for (const c of k.codes ?? []) byCode.set(c, k.id);

const idFromEvent = (e: KeyboardEvent) => {
  const mapped = byCode.get(e.code);
  if (mapped) return mapped;
  if (e.key.length === 1) {
    const ch = e.key.toUpperCase();
    const shifted: Record<string, string> = { "~": "`", "!": "1", "@": "2", "#": "3", $: "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0", _: "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", '"': "'", "<": ",", ">": ".", "?": "/" };
    return shifted[ch] ?? ch;
  }
  return null;
};

export function MiniKeyboard() {
  const [state, setState] = useState<Record<string, Color>>({ return: "blue" });
  const [down, setDown] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  const cycle = (id: string) =>
    setState((s) => {
      const next = colors[(colors.indexOf(s[id] ?? "off") + 1) % colors.length];
      return { ...s, [id]: next };
    });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const onKey = (e: KeyboardEvent) => {
      if (!visible.current || e.repeat || e.metaKey || e.ctrlKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const id = idFromEvent(e);
      if (!id) return;
      cycle(id);
      setDown(id);
      window.setTimeout(() => setDown((d) => (d === id ? null : d)), 120);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-4">
      <FitToWidth>
        <div className="plate flex flex-col gap-1.5 rounded-[20px] p-4" role="group" aria-label="Keyboard playground">
          {rows.map((row, r) => (
            <div key={r} className="flex items-end gap-1">
              {row.map((k) => {
                const color = state[k.id] ?? "off";
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => cycle(k.id)}
                    aria-label={k.label || "space"}
                    data-color={color}
                    data-pressed={down === k.id || undefined}
                    className="mini-key"
                    style={{ width: k.w ?? 40 }}
                  >
                    <span className="mini-key__cap">{k.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </FitToWidth>
      <p className="flex items-center gap-2.5 text-[12px] font-medium leading-4 text-ink-3">
        Go on, press a key. Each click cycles its colour.
        <span className="flex items-center gap-2.5" aria-hidden="true">
          <span className="size-1.5 rounded-full bg-[#2f6bff]" />
          <span className="size-1.5 rounded-full bg-[#22c55e]" />
          <span className="size-1.5 rounded-full bg-[#ff8a1f]" />
          <span className="size-1.5 rounded-full bg-[#f0508a]" />
        </span>
      </p>
    </div>
  );
}
