"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export interface Space {
	id: number;
	name: string;
	description: string | null;
	meta: Record<string, unknown> | null;
	created_at: string;
	updated_at: string;
}

interface SpaceListResponse {
	spaces: Space[];
	total: number;
}

export async function listSpaces(): Promise<Space[]> {
	const data = await apiFetch<SpaceListResponse>("/spaces");
	return data.spaces;
}

export async function createSpace(name: string, description?: string) {
	await apiFetch("/spaces", {
		method: "POST",
		body: JSON.stringify({ name, description: description || null }),
	});

	revalidatePath("/spaces");
}

export async function deleteSpace(spaceId: number) {
	await apiFetch(`/spaces/${spaceId}`, {
		method: "DELETE",
	});

	revalidatePath("/spaces");
}
