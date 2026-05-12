"use server";

import { apiFetch } from "@/lib/api";
import type { Space, SpaceListResponse } from "@/lib/types/space";

export async function listSpaces(): Promise<Space[]> {
	const data = await apiFetch<SpaceListResponse>("/spaces");
	return data.spaces;
}

export async function createSpace(
	name: string,
	description?: string,
): Promise<Space> {
	const space = await apiFetch<Space>("/spaces", {
		method: "POST",
		body: JSON.stringify({
			name,
			description: description || null,
		}),
	});

	return space;
}

export async function deleteSpace(spaceId: string) {
	await apiFetch(`/spaces/${spaceId}`, {
		method: "DELETE",
	});
}
