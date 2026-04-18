"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export interface ApiKey {
	key_id: number;
	name: string;
	key_prefix: string;
	is_active: boolean;
	expires_at: string | null;
	last_used_at: string | null;
	created_at: string;
}

interface ListApiKeysResponse {
	keys: ApiKey[];
}

export async function listApiKeys() {
	const res = await apiFetch<ListApiKeysResponse>("/auth/keys");
	return res.keys;
}

export interface CreateApiKeyResponse {
	key_id: number;
	name: string;
	key_prefix: string;
	raw_key: string;
	expires_at: string | null;
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
