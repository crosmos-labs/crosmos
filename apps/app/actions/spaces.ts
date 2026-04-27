"use server";

import { apiFetch } from "@/lib/api";
import { getActiveOrgId } from "@/lib/auth/cookies";
import type { Space, SpaceListResponse } from "@/lib/types/space";

export async function listSpaces(): Promise<Space[]> {
	const data = await apiFetch<SpaceListResponse>("/spaces");
	return data.spaces;
}

export async function createSpace(name: string, description?: string) {
	const activeOrgId = await getActiveOrgId();
	if (!activeOrgId) {
		throw new Error(
			"No active organization. Please select an organization before creating a space.",
		);
	}
	const space = await apiFetch<Space>("/spaces", {
		method: "POST",
		body: JSON.stringify({
			org_id: activeOrgId,
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
