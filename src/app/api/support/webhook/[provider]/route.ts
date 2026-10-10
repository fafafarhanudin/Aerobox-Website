import { applyEvent, dbConfigured } from "@/lib/support/db";
import { providerById } from "@/lib/support/providers";

export const dynamic = "force-dynamic";

/**
 * Provider webhooks. The raw body is verified by the provider adapter (signature per its docs)
 * before anything is recorded; processing is idempotent, so retries are safe.
 */
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: id } = await params;
  const provider = providerById(id);
  if (!provider || !dbConfigured) return Response.json({ ok: false }, { status: 404 });

  const raw = await req.text();
  const event = await provider.verifyWebhook(req, raw);
  if (!event) return Response.json({ ok: false }, { status: 401 });

  const result = await applyEvent({ provider: id, ...event });
  // 200 for anything we understood (including no-ops) so the provider stops retrying.
  return Response.json({ ok: true, result }, { status: result === "mismatch" ? 409 : 200 });
}
