// Form inbox for the Aerobox Assets library (/library): sponsor, request and support posts are
// forwarded to the Google Sheet web app in SHEETS_WEBHOOK_URL. See library/docs/sponsor-google-sheets.md.
const NEED: Record<string, string[]> = {
  sponsor: ["name", "email", "message"],
  request: ["name", "email", "request"],
  support: ["name", "message"],
};
// every field a form sends, with its longest accepted length; anything else is dropped before the Sheet
const FIELDS: Record<string, number> = {
  name: 80, email: 160, company: 120, budget: 60, message: 2000, request: 1000, suggestion: 1000, kind: 40, page: 200,
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request, { params }: { params: Promise<{ form: string }> }) {
  const { form } = await params;
  const need = NEED[form];
  if (!need) return Response.json({ ok: false }, { status: 404 });

  let d: Record<string, unknown>;
  try {
    d = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (!d || typeof d !== "object") return Response.json({ ok: false }, { status: 400 });
  // honeypot: only bots fill the hidden "website" field; answer as if it worked so they move on
  if (typeof d.website === "string" && d.website.trim()) return Response.json({ ok: true });

  const clean: Record<string, string | string[]> = {};
  for (const [k, max] of Object.entries(FIELDS)) {
    if (typeof d[k] === "string" && d[k].trim()) clean[k] = d[k].trim().slice(0, max);
  }
  // the Sheet script joins placement itself, so it stays a (short) list of short strings
  if (Array.isArray(d.placement)) clean.placement = d.placement.slice(0, 6).map((p) => String(p).slice(0, 60));
  if (need.some((k) => !clean[k])) return Response.json({ ok: false, error: "missing fields" }, { status: 400 });
  if (typeof clean.email === "string" && !EMAIL.test(clean.email)) {
    return Response.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return Response.json({ ok: false, error: "SHEETS_WEBHOOK_URL is not set" }, { status: 503 });
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...clean, form }),
      redirect: "follow",
    });
    return Response.json({ ok: r.ok }, { status: r.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
