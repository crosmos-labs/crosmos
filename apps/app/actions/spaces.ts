"use server";

import { apiFetch } from "@/lib/api";
import { revalidatePath } from "next/cache";

export interface Space {
	id: number;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

export async function listSpaces() {
	return apiFetch<Space[]>("/api/v1/spaces");
}

export async function createSpace(formData: FormData) {
	const name = formData.get("name") as string;
	const description = formData.get("description") as string;

	await apiFetch("/api/v1/spaces", {
		method: "POST",
		body: JSON.stringify({ name, description }),
	});

	revalidatePath("/spaces");
}

export async function deleteSpace(spaceId: number) {
	await apiFetch(`/api/v1/spaces/${spaceId}`, {
		method: "DELETE",
	});

	revalidatePath("/spaces");
}
