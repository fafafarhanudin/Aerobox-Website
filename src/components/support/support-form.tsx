"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { ArrowRight, Check, InfoCircle } from "@untitled-ui/icons-react";
import { Key, Legend } from "@/components/ui";
import {
  MESSAGE_MAX,
  NAME_MAX,
  formatAmount,
  parseCustomAmount,
  regions,
  type Region,
} from "@/lib/support/config";

type Notice = { tone: "ok" | "info" | "error"; text: string } | null;

const fieldCls =
  "w-full rounded-xl border border-line bg-white px-4 text-[15px] tracking-[-0.15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-3 focus:border-accent focus:shadow-[0_0_0_4px_rgba(47,107,255,0.12)] disabled:bg-subtle disabled:text-ink-3";

function Check2({ checked, disabled, onChange, children }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className={`flex items-start gap-3 text-[14px] leading-5 tracking-[-0.14px] ${disabled ? "text-ink-3" : "cursor-pointer text-ink"}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden="true"
        className={`mt-px grid size-5 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:shadow-[0_0_0_4px_rgba(47,107,255,0.18)] ${
          checked ? "border-ink bg-ink text-white" : "border-[#c9cbd1] bg-white"
        }`}
      >
        {checked && <Check width={13} height={13} strokeWidth={2.4} />}
      </span>
      {children}
    </label>
  );
}

export function SupportForm({ available }: { available: Record<Region, boolean> }) {
  const ids = useId();
  const [region, setRegion] = useState<Region>("ID");
  const [preset, setPreset] = useState<number | "custom">(1);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [publicName, setPublicName] = useState(false);
  const [publicMessage, setPublicMessage] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const r = regions[region];
  const amount = preset === "custom" ? parseCustomAmount(custom, r.currency) : r.presets[preset];
  const amountOk = amount !== null && amount >= r.min && amount <= r.max;
  const open = available[region];

  // Return from the provider. The URL is never proof of payment; the wall only shows webhook-confirmed rows.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s === "success") setNotice({ tone: "ok", text: "Thank you! Your contribution appears on the wall as soon as the payment provider confirms it." });
    if (s === "cancelled") setNotice({ tone: "info", text: "Checkout was cancelled. No payment was made." });
  }, []);

  const switchRegion = (next: Region) => {
    setRegion(next);
    setPreset(1);
    setCustom("");
    setNotice(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountOk) {
      setNotice({ tone: "error", text: `Choose an amount between ${formatAmount(r.min, r.currency)} and ${formatAmount(r.max, r.currency)}.` });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/support/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, amount, name, message, anonymous, publicName, publicMessage, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setNotice({ tone: "error", text: data.error ?? "Something went wrong. Please try again." });
    } catch {
      setNotice({ tone: "error", text: "Network error. Check your connection and try again." });
    }
    setBusy(false);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-7 rounded-[20px] border border-line bg-white p-5 shadow-[0_1px_2px_rgba(12,14,20,0.04),0_24px_48px_-24px_rgba(12,14,20,0.18)] md:p-7"
    >
      {/* region */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[13px] font-medium tracking-[-0.13px] text-ink">Region</legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-xl bg-subtle p-1">
          {(Object.keys(regions) as Region[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={region === k}
              onClick={() => switchRegion(k)}
              className={`flex h-11 items-center justify-center gap-2 rounded-[10px] text-[14px] font-medium tracking-[-0.14px] transition-[background-color,color,box-shadow] ${
                region === k ? "bg-white text-ink shadow-[0_1px_2px_rgba(12,14,20,0.08),0_0_0_1px_rgba(12,14,20,0.05)]" : "text-ink-2 hover:text-ink"
              }`}
            >
              {regions[k].label}
              <span className="font-mono text-[11px] text-ink-3">{regions[k].currency}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* amount */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-[13px] font-medium tracking-[-0.13px] text-ink">Contribution</legend>
        <div className="grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-4">
          {r.presets.map((p, i) => (
            <Key
              key={p}
              type="button"
              size="sm"
              pressed={preset === i}
              variant={preset === i ? "primary" : "secondary"}
              onClick={() => setPreset(i)}
              aria-pressed={preset === i}
              className="w-full"
              capClassName="h-11 w-full justify-center font-mono text-[14px]"
            >
              {formatAmount(p, r.currency)}
            </Key>
          ))}
        </div>
        <label
          className={`flex h-12 items-center gap-2 rounded-xl border px-4 transition-[border-color,box-shadow] ${
            preset === "custom" ? "border-accent shadow-[0_0_0_4px_rgba(47,107,255,0.12)]" : "border-line"
          }`}
        >
          <span className="font-mono text-[14px] text-ink-2">{r.currency === "IDR" ? "Rp" : "$"}</span>
          <input
            inputMode={r.currency === "IDR" ? "numeric" : "decimal"}
            placeholder={`Custom amount (min ${formatAmount(r.min, r.currency)})`}
            value={custom}
            onFocus={() => setPreset("custom")}
            onChange={(e) => {
              setPreset("custom");
              setCustom(e.target.value.replace(/[^\d.,\s]/g, "").slice(0, 12));
            }}
            className="h-full min-w-0 flex-1 bg-transparent font-mono text-[15px] text-ink outline-none focus-visible:outline-none placeholder:font-sans placeholder:text-ink-3"
            aria-label="Custom amount"
          />
        </label>
        {preset === "custom" && custom && !amountOk && (
          <p className="text-[13px] text-[#c2410c]">
            Between {formatAmount(r.min, r.currency)} and {formatAmount(r.max, r.currency)}.
          </p>
        )}
      </fieldset>

      {/* note */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-[13px] font-medium tracking-[-0.13px] text-ink">
          Your note <span className="font-normal text-ink-3">optional</span>
        </legend>
        <input
          id={`${ids}-name`}
          className={`${fieldCls} h-12`}
          placeholder="Display name"
          maxLength={NAME_MAX}
          value={anonymous ? "" : name}
          disabled={anonymous}
          onChange={(e) => setName(e.target.value)}
          aria-label="Display name"
        />
        <div className="relative">
          <textarea
            className={`${fieldCls} min-h-[104px] resize-y py-3 leading-[22px]`}
            placeholder="Leave a message"
            maxLength={MESSAGE_MAX}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-label="Message"
          />
          <span className="pointer-events-none absolute bottom-2.5 right-3 font-mono text-[11px] text-ink-3">
            {message.length}/{MESSAGE_MAX}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <Check2 checked={anonymous} onChange={(v) => { setAnonymous(v); if (v) setPublicName(false); }}>
            Contribute anonymously
          </Check2>
          <Check2 checked={publicName} disabled={anonymous || !name.trim()} onChange={setPublicName}>
            Display my name and contribution publicly.
          </Check2>
          <Check2 checked={publicMessage} disabled={!message.trim()} onChange={setPublicMessage}>
            Display my message publicly.
          </Check2>
        </div>
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
      </fieldset>

      {notice && (
        <p
          role={notice.tone === "error" ? "alert" : "status"}
          className={`flex gap-2.5 rounded-xl px-4 py-3 text-[14px] leading-5 ${
            notice.tone === "ok" ? "bg-[#ecfdf3] text-[#067647]" : notice.tone === "error" ? "bg-[#fef3f2] text-[#b42318]" : "bg-subtle text-ink-2"
          }`}
        >
          {notice.text}
        </p>
      )}

      {open ? (
        <Key
          type="submit"
          variant="primary"
          disabled={busy || !amountOk}
          className="w-full"
          capClassName="h-12 w-full justify-center gap-2.5 text-[16px] font-medium tracking-[-0.16px]"
        >
          {busy ? "Opening secure checkout…" : `Continue with ${amount && amountOk ? formatAmount(amount, r.currency) : "checkout"}`}
          <Legend>
            <ArrowRight width={12} height={12} strokeWidth={2} />
          </Legend>
        </Key>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl bg-subtle p-4">
          <p className="flex gap-2.5 text-[14px] leading-5 tracking-[-0.14px] text-ink-2">
            <InfoCircle width={18} height={18} strokeWidth={1.8} className="mt-px shrink-0 text-ink-3" />
            <span>
              Online checkout for {r.label === "Indonesia" ? "Indonesia" : "international supporters"} is being set up.
              {region === "ID" ? " Until then you can support right away with QRIS." : " Check back soon."}
            </span>
          </p>
          {region === "ID" && (
            <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-3">
              <Image
                src="/library/qris-code.png"
                alt="QRIS code for Aerobox Design"
                width={112}
                height={112}
                className="size-[112px] shrink-0 rounded-lg [image-rendering:pixelated]"
              />
              <div className="flex min-w-0 flex-col gap-1.5 text-[13px] leading-5 text-ink-2">
                <span className="text-[14px] font-medium tracking-[-0.14px] text-ink">Scan with any e-wallet or bank app</span>
                <span>Enter {amount && amountOk ? formatAmount(amount, r.currency) : "your amount"} yourself. QRIS transfers are direct, so they are not listed on the wall automatically.</span>
                <a href="/library/qris-code.png" download="aerobox-qris.png" className="w-fit font-medium text-accent hover:underline">
                  Save QR code
                </a>
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-center font-mono text-[11px] leading-4 text-ink-3">No card details are collected or stored by Aerobox.</p>
    </form>
  );
}
