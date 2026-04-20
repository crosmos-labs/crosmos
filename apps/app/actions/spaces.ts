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
	if (!activeOrgId) {
		throw new Error("No active organization. Please select an organization before creating a space.");
	}
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
