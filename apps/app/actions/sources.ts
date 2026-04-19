"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { Source } from "@/lib/types/source";

export async function listSources(spaceId: number) {
	return apiFetch<Source[]>(`/spaces/${spaceId}/sources`);
}

export async function createSource(formData: FormData) {
	const rawSpaceId = formData.get("space_id");
	const rawName = formData.get("name");
	const rawType = formData.get("type");

	if (
		typeof rawSpaceId !== "string" ||
		typeof rawName !== "string" ||
		typeof rawType !== "string"
	) {
		return { error: "Missing or invalid form fields" };
	}

	const spaceId = Number(rawSpaceId);
	if (Number.isNaN(spaceId)) {
		return { error: "space_id must be a valid number" };
	}

	await apiFetch(`/spaces/${spaceId}/sources`, {
		method: "POST",
		body: JSON.stringify({ name: rawName, type: rawType }),
	});

	revalidatePath("/spaces");
}

export async function deleteSource(spaceId: number, sourceId: number) {
	await apiFetch(`/spaces/${spaceId}/sources/${sourceId}`, {
		method: "DELETE",
	});

	revalidatePath("/spaces");
}
