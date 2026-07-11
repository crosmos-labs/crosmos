"use server";

import { type ActionResult, toActionError } from "@/lib/action-result";
import { apiFetch } from "@/lib/api";
import { MEMORIES_PER_PAGE } from "@/lib/params/constants";
import type { Memory, MemoryListResponse } from "@/lib/types/memory";

export async function listMemories(
	spaceUuid: string,
	options?: { limit?: number; offset?: number },
): Promise<{ memories: Memory[]; hasMore: boolean }> {
	const limit = options?.limit ?? MEMORIES_PER_PAGE;
	const offset = options?.offset ?? 0;
	const data = await apiFetch<MemoryListResponse>(
		`/memories?space_uuid=${spaceUuid}&sort_by=created_at&order=desc&limit=${limit}&offset=${offset}`,
	);
	return {
		memories: data.memories,
		hasMore: data.memories.length === limit,
	};
}

export async function forgetMemory(
	memoryUuid: string,
	spaceUuid: string,
): Promise<ActionResult<void>> {
	try {
		await apiFetch(`/memories/${memoryUuid}?space_uuid=${spaceUuid}`, {
			method: "DELETE",
		});
		return { ok: true, data: undefined };
	} catch (err) {
		return toActionError(err);
	}
}
