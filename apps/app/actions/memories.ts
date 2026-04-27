"use server";

import { apiFetch } from "@/lib/api";
import type { Memory, MemoryListResponse } from "@/lib/types/memory";

export async function listMemories(spaceUuid: string): Promise<Memory[]> {
	const data = await apiFetch<MemoryListResponse>(
		`/memories?space_uuid=${spaceUuid}&sort_by=created_at&order=desc`,
	);
	return data.memories;
}

export async function forgetMemory(
	memoryUuid: string,
	spaceUuid: string,
): Promise<void> {
	await apiFetch(`/memories/${memoryUuid}?space_uuid=${spaceUuid}`, {
		method: "DELETE",
	});
}
