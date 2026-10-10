import { regions, validateContribution } from "@/lib/support/config";
import { attachRef, createPending, dbConfigured, markFailed } from "@/lib/support/db";
import { providerFor } from "@/lib/support/providers";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Create a checkout session for a voluntary contribution. The amount is validated here, never on trust. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const v = validateContribution(body);
  if (!v.ok) return Response.json({ ok: false, error: v.error }, { status: 400 });

  const provider = providerFor(v.value.region);
  if (!provider || !dbConfigured) {
    return Response.json(
      { ok: false, code: "unavailable", error: "Online checkout for this region is not open yet." },
      { status: 503 },
    );
  }

  const currency = regions[v.value.region].currency;
  const id = await createPending({ provider: provider.id, currency, ...v.value });
  try {
    const { url, ref } = await provider.createCheckout({
      ...v.value,
      contributionId: id,
      currency,
      returnUrl: `${site.url}/support`,
    });
    await attachRef(id, ref);
    return Response.json({ ok: true, url });
  } catch {
    await markFailed(id);
    return Response.json({ ok: false, error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
