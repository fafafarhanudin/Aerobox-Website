// Shared (client + server) rules for Aerobox Support. Amounts are stored in minor units:
// IDR has no minor unit (1 = Rp1), USD is in cents.

export type Region = "ID" | "INTL";
export type Currency = "IDR" | "USD";

export const regions: Record<Region, { label: string; currency: Currency; presets: number[]; min: number; max: number }> = {
  ID: { label: "Indonesia", currency: "IDR", presets: [10_000, 25_000, 50_000, 100_000], min: 10_000, max: 10_000_000 },
  INTL: { label: "International", currency: "USD", presets: [200, 500, 1_000, 2_500], min: 200, max: 100_000 },
};

export const NAME_MAX = 40;
export const MESSAGE_MAX = 280;

export function formatAmount(minor: number, currency: Currency) {
  return currency === "IDR"
    ? `Rp${minor.toLocaleString("id-ID")}`
    : `$${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: minor % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/** Turn what the visitor typed into minor units ("25.000" → 25000 IDR, "7.5" → 750 cents). */
export function parseCustomAmount(raw: string, currency: Currency): number | null {
  const s = raw.trim();
  if (!s) return null;
  if (currency === "IDR") {
    const digits = s.replace(/[.\s,]/g, "");
    return /^\d{1,9}$/.test(digits) ? Number(digits) : null;
  }
  const m = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(s.replace(/\s/g, ""));
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? "0").padEnd(2, "0"));
}

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
  return {
    ok: true,
    value: {
      region,
      amount,
      name,
      message,
      anonymous,
      publicName: !anonymous && !!name && b.publicName === true,
      publicMessage: !!message && b.publicMessage === true,
    },
  };
}
