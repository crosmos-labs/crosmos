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

export type ProviderId = "anthropic" | "openai" | "google";

export interface ModelMeta {
	/** Provider model id — also the allowlist key sent from the client. */
	id: string;
	label: string;
	provider: ProviderId;
}

// One model per provider. Google's Gemini API has a free tier (AI Studio),
// so it's the default for zero-cost testing; Anthropic and OpenAI are paid.
export const MODELS: readonly ModelMeta[] = [
	{ id: "claude-sonnet-4-6", label: "Sonnet 4.6", provider: "anthropic" },
];

export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";

export const PROVIDER_LABELS: Record<ProviderId, string> = {
	anthropic: "Anthropic",
	openai: "OpenAI",
	google: "Google",
};

/** Order providers appear in the selector. */
export const PROVIDER_ORDER: readonly ProviderId[] = [
	"anthropic",
	"openai",
	"google",
];

export function isValidModelId(id: string): boolean {
	return MODELS.some((m) => m.id === id);
}
