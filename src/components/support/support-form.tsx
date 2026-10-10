"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { ArrowRight, Check, Lock01 } from "@untitled-ui/icons-react";
import { Key, Legend } from "@/components/ui";
import {
  EMAIL_MAX,
  MESSAGE_MAX,
  NAME_MAX,
  formatAmount,
  groupIdr,
  isEmail,
  parseCustomAmount,
  regions,
  type Region,
} from "@/lib/support/config";

type Notice = { tone: "ok" | "info" | "error"; text: string } | null;

const labelCls = "text-[12px] font-medium uppercase tracking-[0.06em] text-ink-3";
const fieldCls =
  "w-full rounded-xl border border-line bg-white px-3.5 text-[14px] tracking-[-0.14px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-3 focus:border-accent focus:shadow-[0_0_0_4px_rgba(47,107,255,0.12)] focus-visible:outline-none disabled:bg-subtle disabled:text-ink-3";

function Toggle({ checked, disabled, onChange, children }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className={`flex items-center gap-2.5 text-[13px] leading-5 tracking-[-0.13px] ${disabled ? "text-ink-3" : "cursor-pointer text-ink"}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden="true"
        className={`grid size-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors peer-focus-visible:shadow-[0_0_0_4px_rgba(47,107,255,0.18)] ${
          checked ? "border-ink bg-ink text-white" : "border-[#c9cbd1] bg-white"
        }`}
      >
        {checked && <Check width={12} height={12} strokeWidth={2.6} />}
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
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [publicName, setPublicName] = useState(false);
  const [publicMessage, setPublicMessage] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const r = regions[region];
  const amount = preset === "custom" ? parseCustomAmount(custom, r.currency) : r.presets[preset];
  const inRange = amount !== null && amount >= r.min && amount <= r.max;
  const emailOk = !email.trim() || isEmail(email.trim());
  const open = available[region];
  const customError =
    preset === "custom" && custom.trim()
      ? amount === null
        ? r.currency === "IDR" ? "Use whole rupiah, e.g. 15.000." : "Use a number like 7 or 7.50."
        : !inRange
          ? `Between ${formatAmount(r.min, r.currency)} and ${formatAmount(r.max, r.currency)}.`
          : null
      : null;

  // Back from the provider. The URL is never proof of payment; the wall only lists webhook-confirmed rows.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("status");
    if (s === "success") setNotice({ tone: "ok", text: "Thank you! Your contribution appears on the wall once the payment is confirmed." });
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
    if (!inRange || !emailOk) {
      setNotice({
        tone: "error",
        text: !inRange
          ? `Choose an amount between ${formatAmount(r.min, r.currency)} and ${formatAmount(r.max, r.currency)}.`
          : "Enter a valid email or leave it empty.",
      });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/support/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, amount, name, email: email.trim(), message, anonymous, publicName, publicMessage, website }),
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

  const shown = inRange && amount !== null ? formatAmount(amount, r.currency) : "—";

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_1px_2px_rgba(12,14,20,0.04),0_24px_48px_-28px_rgba(12,14,20,0.2)] md:grid-cols-2"
    >
      {/* left: region + amount */}
      <div className="flex flex-col gap-5 p-5 md:border-r md:border-line md:p-6">
        <div role="radiogroup" aria-label="Region" className="grid grid-cols-2 gap-1 rounded-xl bg-subtle p-1">
          {(Object.keys(regions) as Region[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={region === k}
              onClick={() => switchRegion(k)}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-[10px] text-[13px] font-medium tracking-[-0.13px] transition-[background-color,color,box-shadow] ${
                region === k ? "bg-white text-ink shadow-[0_1px_2px_rgba(12,14,20,0.08),0_0_0_1px_rgba(12,14,20,0.05)]" : "text-ink-2 hover:text-ink"
              }`}
            >
              {regions[k].label}
              <span className="font-mono text-[11px] text-ink-3">— {regions[k].currency}</span>
            </button>
          ))}
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[15px] font-medium tracking-[-0.15px] text-ink">Choose your contribution</legend>
          <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
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
                capClassName="h-10 w-full justify-center font-mono text-[13px]"
              >
                {formatAmount(p, r.currency)}
              </Key>
            ))}
          </div>
          <label
            className={`flex h-11 items-center gap-2 rounded-xl border px-3.5 transition-[border-color,box-shadow] ${
              customError ? "border-[#f04438]" : preset === "custom" ? "border-accent shadow-[0_0_0_4px_rgba(47,107,255,0.12)]" : "border-line"
            }`}
          >
            <span className="font-mono text-[13px] text-ink-2">{r.currency === "IDR" ? "Rp" : "$"}</span>
            <input
              inputMode={r.currency === "IDR" ? "numeric" : "decimal"}
              placeholder="Custom amount"
              value={custom}
              onFocus={() => setPreset("custom")}
              onChange={(e) => {
                setPreset("custom");
                setCustom(r.currency === "IDR" ? groupIdr(e.target.value) : e.target.value.replace(/[^\d.,]/g, "").slice(0, 9));
              }}
              className="h-full min-w-0 flex-1 bg-transparent font-mono text-[14px] text-ink outline-none placeholder:font-sans placeholder:text-ink-3 focus-visible:outline-none"
              aria-label="Custom amount"
              aria-invalid={!!customError}
              aria-describedby={`${ids}-amt`}
              style={{ outline: "none" }} // the wrapping label draws the focus ring
            />
          </label>
          <p id={`${ids}-amt`} className={`text-[12px] leading-4 ${customError ? "text-[#d92d20]" : "text-ink-3"}`}>
            {customError ?? `Minimum ${formatAmount(r.min, r.currency)} · one-time, no account needed`}
          </p>
        </fieldset>

        {!open && region === "ID" && (
          <div className="mt-auto flex items-center gap-4 rounded-xl bg-subtle p-3">
            <Image
              src="/library/qris-code.png"
              alt="QRIS code for Aerobox Design"
              width={132}
              height={132}
              className="size-[112px] shrink-0 rounded-lg bg-white p-1.5 [image-rendering:pixelated] md:size-[132px]"
            />
            <p className="text-[12px] leading-[18px] text-ink-2">
              <span className="block text-[13px] font-medium text-ink">Pay now with QRIS</span>
              Scan with any e-wallet or bank app and enter {shown === "—" ? "your amount" : shown}. Direct transfers aren&apos;t listed on the wall.{" "}
              <a href="/library/qris-code.png" download="aerobox-qris.png" className="font-medium text-accent hover:underline">
                Save QR
              </a>
            </p>
          </div>
        )}
      </div>

      {/* right: details, privacy, summary, action */}
      <div className="flex flex-col gap-4 border-t border-line bg-[#fbfbfa] p-5 md:border-t-0 md:p-6">
        <div className="flex flex-col gap-2">
          <span className={labelCls}>Your details · optional</span>
          <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <input
              className={`${fieldCls} h-10`}
              placeholder="Display name"
              maxLength={NAME_MAX}
              value={anonymous ? "" : name}
              disabled={anonymous}
              onChange={(e) => setName(e.target.value)}
              aria-label="Display name"
              autoComplete="nickname"
            />
            <input
              className={`${fieldCls} h-10 ${emailOk ? "" : "border-[#f04438]"}`}
              type="email"
              placeholder="Email for receipt"
              maxLength={EMAIL_MAX}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              aria-invalid={!emailOk}
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <textarea
              rows={2}
              className={`${fieldCls} max-h-[132px] min-h-[64px] resize-none py-2.5 pr-14 leading-5 [field-sizing:content]`}
              placeholder="Message to Aerobox"
              maxLength={MESSAGE_MAX}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-label="Message to Aerobox"
            />
            <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] text-ink-3">
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={labelCls}>Privacy</span>
          <Toggle
            checked={anonymous}
            onChange={(v) => {
              setAnonymous(v);
              if (v) setPublicName(false);
            }}
          >
            Contribute anonymously
          </Toggle>
          <Toggle checked={publicName} disabled={anonymous || !name.trim()} onChange={setPublicName}>
            Display my name and contribution publicly
          </Toggle>
          <Toggle checked={publicMessage} disabled={!message.trim()} onChange={setPublicMessage}>
            Display my message publicly
          </Toggle>
          <p className="text-[12px] leading-4 text-ink-3">Nothing is public unless you tick it. Your email is never shown.</p>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-ink-2">One-time · {r.label}</span>
            <span className="font-mono text-[20px] font-medium tracking-[-0.4px] text-ink">{shown}</span>
          </div>

          {notice && (
            <p
              role={notice.tone === "error" ? "alert" : "status"}
              className={`rounded-lg px-3 py-2 text-[13px] leading-[18px] ${
                notice.tone === "ok" ? "bg-[#eef3ff] text-[#1d4ed8]" : notice.tone === "error" ? "bg-[#fef3f2] text-[#b42318]" : "bg-subtle text-ink-2"
              }`}
            >
              {notice.text}
            </p>
          )}

          {open ? (
            <Key
              type="submit"
              variant="primary"
              disabled={busy || !inRange || !emailOk}
              className="w-full"
              capClassName="h-11 w-full justify-center gap-2.5 text-[15px] font-medium tracking-[-0.15px]"
            >
              {busy ? "Opening secure checkout…" : "Continue to secure checkout"}
              <Legend>
                <ArrowRight width={12} height={12} strokeWidth={2} />
              </Legend>
            </Key>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-3 py-3 text-center text-[13px] leading-[18px] text-ink-2">
              {region === "ID" ? "Card & e-wallet checkout opens soon — QRIS works today." : "International checkout opens soon."}
            </p>
          )}
          <p className="flex items-center justify-center gap-1.5 text-[11px] leading-4 text-ink-3">
            <Lock01 width={12} height={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
            Secure provider checkout · no card data stored
          </p>
        </div>
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
      </div>
    </form>
  );
}
