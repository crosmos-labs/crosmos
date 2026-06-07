"use server";

import { type ActionResult, toActionError } from "@/lib/action-result";
import { apiFetch } from "@/lib/api";
import type { Space, SpaceListResponse } from "@/lib/types/space";

export async function listSpaces(): Promise<Space[]> {
	const data = await apiFetch<SpaceListResponse>("/spaces");
	return data.spaces;
}

export async function createSpace(
	name: string,
	description?: string,
): Promise<ActionResult<Space>> {
	try {
		const space = await apiFetch<Space>("/spaces", {
			method: "POST",
			body: JSON.stringify({
				name,
				description: description || null,
			}),
		});
		return { ok: true, data: space };
	} catch (err) {
		return toActionError(err);
	}
}

export async function deleteSpace(spaceId: string) {
	await apiFetch(`/spaces/${spaceId}`, {
		method: "DELETE",
	});
}
