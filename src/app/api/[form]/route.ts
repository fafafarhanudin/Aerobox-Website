// Form inbox for the Aerobox Assets library (/library): sponsor, request and support posts are
// forwarded to the Google Sheet web app in SHEETS_WEBHOOK_URL. See library/docs/sponsor-google-sheets.md.
const NEED: Record<string, string[]> = {
  sponsor: ["name", "email", "message"],
  request: ["name", "email", "request"],
  support: ["name", "message"],
};

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
  if (need.some((k) => !String(d[k] ?? "").trim())) {
    return Response.json({ ok: false, error: "missing fields" }, { status: 400 });
  }

  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return Response.json({ ok: false, error: "SHEETS_WEBHOOK_URL is not set" }, { status: 503 });
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, form }),
      redirect: "follow",
    });
    return Response.json({ ok: r.ok }, { status: r.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
