import "server-only";

import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";
import { MODELS } from "./models";

/**
 * Resolve a validated model id to a provider-backed `LanguageModel`.
 *
 * Server-only: importing this from a client component would pull the provider
 * SDKs (and their key handling) into the browser bundle. Callers MUST validate
 * the id with `isValidModelId` first; this also throws on unknown ids as
 * defense-in-depth so an arbitrary string can never reach a provider factory.
 */
export function resolveModel(id: string): LanguageModel {
	const meta = MODELS.find((m) => m.id === id);
	if (!meta) throw new Error(`Unknown model id: ${id}`);

	switch (meta.provider) {
		case "anthropic":
			return anthropic(meta.id);
	}
}
