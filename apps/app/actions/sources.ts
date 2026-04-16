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
	const spaceId = formData.get("space_id") as string;
	const name = formData.get("name") as string;
	const type = formData.get("type") as string;

	await apiFetch(`/api/v1/spaces/${spaceId}/sources`, {
		method: "POST",
		body: JSON.stringify({ name, type }),
	});

	revalidatePath("/spaces");
}

export async function deleteSource(spaceId: number, sourceId: number) {
	await apiFetch(`/api/v1/spaces/${spaceId}/sources/${sourceId}`, {
		method: "DELETE",
	});

	revalidatePath("/spaces");
}
