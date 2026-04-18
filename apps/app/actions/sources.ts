"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export interface Source {
	id: number;
	space_id: number;
	name: string;
	type: string;
	status: string;
	created_at: string;
}

export async function listSources(spaceId: number) {
	return apiFetch<Source[]>(`/api/v1/spaces/${spaceId}/sources`);
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

	await apiFetch(`/api/v1/spaces/${spaceId}/sources`, {
		method: "POST",
		body: JSON.stringify({ name: rawName, type: rawType }),
	});

	revalidatePath("/spaces");
}

export async function deleteSource(spaceId: number, sourceId: number) {
	await apiFetch(`/api/v1/spaces/${spaceId}/sources/${sourceId}`, {
		method: "DELETE",
	});

	revalidatePath("/spaces");
}
