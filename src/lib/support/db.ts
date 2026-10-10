import "server-only";
import { neon } from "@neondatabase/serverless";
import type { Currency, Region } from "./config";

// Neon Postgres (added through Vercel → Storage, which sets DATABASE_URL). Only the minimum is stored:
// no card data, no email, no address — the provider holds those.
const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
export const dbConfigured = Boolean(url);
const sql = url ? neon(url) : null;

export type Status = "pending" | "paid" | "failed" | "cancelled" | "expired" | "refunded" | "disputed";

let ready: Promise<unknown> | null = null;
function schema() {
  if (!sql) throw new Error("DATABASE_URL is not set");
  ready ??= sql`
    create table if not exists support_contributions (
      id uuid primary key default gen_random_uuid(),
      provider text not null,
      provider_ref text,
      region text not null,
      currency text not null,
      amount_minor integer not null check (amount_minor > 0),
      status text not null default 'pending',
      display_name text not null default '',
      message text not null default '',
      anonymous boolean not null default false,
      public_name boolean not null default false,
      public_message boolean not null default false,
      created_at timestamptz not null default now(),
      paid_at timestamptz,
      updated_at timestamptz not null default now(),
      unique (provider, provider_ref)
    )`.then(() => sql!`create index if not exists support_wall_idx on support_contributions (paid_at desc) where status = 'paid'`);
  return ready;
}

export async function createPending(c: {
  provider: string; region: Region; currency: Currency; amount: number;
  name: string; message: string; anonymous: boolean; publicName: boolean; publicMessage: boolean;
}) {
  await schema();
  const rows = await sql!`
    insert into support_contributions (provider, region, currency, amount_minor, display_name, message, anonymous, public_name, public_message)
    values (${c.provider}, ${c.region}, ${c.currency}, ${c.amount}, ${c.name}, ${c.message}, ${c.anonymous}, ${c.publicName}, ${c.publicMessage})
    returning id`;
  return rows[0].id as string;
}

export async function attachRef(id: string, ref: string) {
  await schema();
  await sql!`update support_contributions set provider_ref = ${ref}, updated_at = now() where id = ${id}`;
}

export async function markFailed(id: string) {
  await schema();
  await sql!`update support_contributions set status = 'failed', updated_at = now() where id = ${id} and status = 'pending'`;
}

const FINAL: Status[] = ["refunded", "disputed"];

/**
 * Apply a verified provider event. Idempotent: replays are no-ops, a paid row is never paid twice,
 * and refunded/disputed rows never return to the wall. The amount must match what was requested.
 */
export async function applyEvent(e: { provider: string; ref: string; status: Status; amount?: number; currency?: Currency }) {
  await schema();
  const rows = await sql!`select id, status, amount_minor, currency from support_contributions where provider = ${e.provider} and provider_ref = ${e.ref}`;
  const row = rows[0];
  if (!row) return "unknown" as const;
  if (row.status === e.status || FINAL.includes(row.status as Status)) return "noop" as const;
  if (e.status === "paid") {
    if ((e.amount !== undefined && e.amount !== row.amount_minor) || (e.currency && e.currency !== row.currency)) return "mismatch" as const;
    await sql!`update support_contributions set status = 'paid', paid_at = coalesce(paid_at, now()), updated_at = now() where id = ${row.id} and status <> 'paid'`;
    return "paid" as const;
  }
  await sql!`update support_contributions set status = ${e.status}, updated_at = now() where id = ${row.id}`;
  return "updated" as const;
}

export type WallEntry = { id: string; name: string | null; amount: string | null; message: string | null; paidAt: string };

/** Only verified payments whose supporter opted in to something public. */
export async function getWall(limit = 60): Promise<WallEntry[]> {
  if (!sql) return [];
  await schema();
  const rows = await sql`
    select id, display_name, message, anonymous, public_name, public_message, amount_minor, currency, paid_at
    from support_contributions
    where status = 'paid' and (public_name or public_message)
    order by paid_at desc limit ${limit}`;
  const { formatAmount } = await import("./config");
  return rows.map((r) => ({
    id: r.id,
    name: r.public_name && !r.anonymous && r.display_name ? r.display_name : null,
    amount: r.public_name && !r.anonymous ? formatAmount(r.amount_minor, r.currency) : null,
    message: r.public_message && r.message ? r.message : null,
    paidAt: new Date(r.paid_at).toISOString(),
  }));
}
