"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type {
	CreateApiKeyResponse,
	ListApiKeysResponse,
} from "@/lib/types/api-key";

export async function listApiKeys() {
	const res = await apiFetch<ListApiKeysResponse>("/auth/keys");
	return res.keys;
}

export async function createApiKey(name: string, expiresInDays?: number) {
	const body: Record<string, unknown> = { name };
	if (expiresInDays) {
		body.expires_at = new Date(
			Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
		).toISOString();
	}

	const res = await apiFetch<CreateApiKeyResponse>("/auth/keys", {
		method: "POST",
		body: JSON.stringify(body),
	});

	revalidatePath("/api-key");
	return res;
}

export async function revokeApiKey(keyId: number) {
	await apiFetch(`/auth/keys/${keyId}`, {
		method: "DELETE",
	});

	revalidatePath("/api-key");
}
