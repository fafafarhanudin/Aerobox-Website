// Shared (client + server) rules for Aerobox Support. Amounts are stored in minor units:
// IDR has no minor unit (1 = Rp1), USD is in cents.

export type Region = "ID" | "INTL";
export type Currency = "IDR" | "USD";

// USD minimum follows the payment provider; set NEXT_PUBLIC_SUPPORT_USD_MIN_CENTS once one is chosen.
const usdMin = Math.max(1, Number(process.env.NEXT_PUBLIC_SUPPORT_USD_MIN_CENTS) || 100);

export const regions: Record<Region, { label: string; currency: Currency; presets: number[]; min: number; max: number }> = {
  ID: { label: "Indonesia", currency: "IDR", presets: [1_000, 5_000, 10_000, 25_000], min: 1_000, max: 10_000_000 },
  INTL: { label: "International", currency: "USD", presets: [100, 200, 500, 1_000], min: usdMin, max: 100_000 },
};

export const NAME_MAX = 40;
export const EMAIL_MAX = 254;
export const MESSAGE_MAX = 280;

export function formatAmount(minor: number, currency: Currency) {
  return currency === "IDR"
    ? `Rp${minor.toLocaleString("id-ID")}`
    : `$${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: minor % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/** Turn what the visitor typed into minor units ("25.000" → 25000 IDR, "7.5" → 750 cents). Never rounds. */
export function parseCustomAmount(raw: string, currency: Currency): number | null {
  const s = raw.trim();
  if (!s) return null;
  if (currency === "IDR") {
    // Indonesian grouping only: "1000", "1.000", "1 000" — a decimal part is rejected rather than dropped
    if (!/^\d{1,3}([.\s]?\d{3})*$/.test(s) && !/^\d{1,9}$/.test(s)) return null;
    const n = Number(s.replace(/[.\s]/g, ""));
    return Number.isSafeInteger(n) && n > 0 ? n : null;
  }
  const m = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(s.replace(/\s/g, ""));
  if (!m) return null;
  const n = Number(m[1]) * 100 + Number((m[2] ?? "0").padEnd(2, "0"));
  return n > 0 ? n : null;
}

/** "Rp1.000" while typing: group digits the Indonesian way without changing the value. */
export const groupIdr = (raw: string) => {
  const d = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 9);
  return d ? Number(d).toLocaleString("id-ID") : "";
};

export const isEmail = (v: string) => /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(v);

/** Plain text only: strip control chars, collapse whitespace, trim to a max length. React escapes on render. */
export function cleanText(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export type ContributionInput = {
  region: Region;
  amount: number; // minor units
  name: string;
  email: string; // optional; passed to the provider for a receipt, never stored or shown
  message: string;
  anonymous: boolean;
  publicName: boolean;
  publicMessage: boolean;
};

/** Server-side validation; never trust the client. Returns an error string or the clean input. */
export function validateContribution(body: unknown): { ok: true; value: ContributionInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const b = body as Record<string, unknown>;
  if (typeof b.website === "string" && b.website) return { ok: false, error: "Invalid request." }; // honeypot
  const region = b.region === "ID" || b.region === "INTL" ? b.region : null;
  if (!region) return { ok: false, error: "Choose a region." };
  const r = regions[region];
  const amount = typeof b.amount === "number" && Number.isSafeInteger(b.amount) ? b.amount : NaN;
  if (!(amount >= r.min && amount <= r.max))
    return { ok: false, error: `Amount must be between ${formatAmount(r.min, r.currency)} and ${formatAmount(r.max, r.currency)}.` };
  const anonymous = b.anonymous === true;
  const name = anonymous ? "" : cleanText(b.name, NAME_MAX);
  const message = cleanText(b.message, MESSAGE_MAX);
  const email = typeof b.email === "string" ? b.email.trim().slice(0, EMAIL_MAX) : "";
  if (email && !isEmail(email)) return { ok: false, error: "Enter a valid email or leave it empty." };
  return {
    ok: true,
    value: {
      region,
      amount,
      name,
      email,
      message,
      anonymous,
      publicName: !anonymous && !!name && b.publicName === true,
      publicMessage: !!message && b.publicMessage === true,
    },
  };
}
