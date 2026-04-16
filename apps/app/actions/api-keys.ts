"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export interface ApiKey {
	id: string;
	name: string;
	prefix: string;
	created_at: string;
	last_used_at: string | null;
}

export async function listApiKeys() {
	return apiFetch<ApiKey[]>("/api/v1/api-keys");
}

export async function createApiKey(formData: FormData) {
	const name = formData.get("name") as string;

	await apiFetch("/api/v1/api-keys", {
		method: "POST",
		body: JSON.stringify({ name }),
	});

	revalidatePath("/api-key");
}

export async function revokeApiKey(keyId: string) {
	await apiFetch(`/api/v1/api-keys/${keyId}`, {
		method: "DELETE",
	});

	revalidatePath("/api-key");
}
