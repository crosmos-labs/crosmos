"use server";

import { revalidatePath } from "next/cache";
import { getActiveOrgId } from "@/lib/auth/cookies";
import { apiFetch } from "@/lib/api";
import type { Space, SpaceListResponse } from "@/lib/types/space";

export async function listSpaces(): Promise<Space[]> {
	const data = await apiFetch<SpaceListResponse>("/spaces");
	return data.spaces;
}

export async function createSpace(name: string, description?: string) {
	const activeOrgId = await getActiveOrgId();
	await apiFetch("/spaces", {
		method: "POST",
		body: JSON.stringify({
			name,
			description: description || null,
			org_id: activeOrgId,
		}),
	});

	revalidatePath("/spaces");
}

export async function deleteSpace(spaceId: number) {
	await apiFetch(`/spaces/${spaceId}`, {
		method: "DELETE",
	});

	revalidatePath("/spaces");
}
