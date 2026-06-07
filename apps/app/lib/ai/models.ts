/**
 * Client-safe model registry for the playground chat.
 *
 * This module is imported by both the client component (for the model selector)
 * and the server route handler (for validation). It must stay free of any
 * provider SDK imports — those live in `resolve-model.ts` (server-only).
 *
 * The `id`s are the real provider model identifiers passed straight to the
 * AI SDK provider factories. Confirm them against each provider's current
 * catalog when rotating models; a stale id only fails at first real send.
 */

export type ProviderId = "anthropic";

export interface ModelMeta {
	/** Provider model id — also the allowlist key sent from the client. */
	id: string;
	label: string;
	provider: ProviderId;
}

export const MODELS: readonly ModelMeta[] = [
	{ id: "claude-sonnet-4-6", label: "Sonnet 4.6", provider: "anthropic" },
];

export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";

// Max characters in a single user message; enforced server-side, shown as a
// live counter client-side.
export const MAX_INPUT_CHARS = 8000;

export const PROVIDER_LABELS: Record<ProviderId, string> = {
	anthropic: "Anthropic",
};

export const PROVIDER_ORDER: readonly ProviderId[] = ["anthropic"];

export function isValidModelId(id: string): boolean {
	return MODELS.some((m) => m.id === id);
}
