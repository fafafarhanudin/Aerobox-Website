import "server-only";
import type { ContributionInput, Currency, Region } from "./config";
import type { Status } from "./db";

/**
 * A payment provider adapter. None is registered yet: a provider is only added once its account is
 * approved, its terms allow voluntary tips, and its credentials are set as environment variables.
 * Until then checkout reports the region as unavailable — no mock or simulated payments.
 */
export type ProviderEvent = { ref: string; status: Status; amount?: number; currency?: Currency };

export type Provider = {
  id: string; // e.g. "xendit" (Indonesia) or "polar" (international)
  region: Region;
  configured: () => boolean;
  createCheckout: (c: ContributionInput & { contributionId: string; currency: Currency; returnUrl: string }) => Promise<{ url: string; ref: string }>;
  /** Verify the signature per the provider's docs; return null when it is not authentic. */
  verifyWebhook: (req: Request, rawBody: string) => Promise<ProviderEvent | null>;
};

const registry: Provider[] = [];

export const providerFor = (region: Region) => registry.find((p) => p.region === region && p.configured());
export const providerById = (id: string) => registry.find((p) => p.id === id && p.configured());
export const availability = (): Record<Region, boolean> => ({ ID: !!providerFor("ID"), INTL: !!providerFor("INTL") });
