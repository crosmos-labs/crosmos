"use server";

import { type ActionResult, toActionError } from "@/lib/action-result";
import { apiFetch } from "@/lib/api";
import { MEMORIES_PER_PAGE } from "@/lib/params/constants";
import type {
	Memory,
	MemoryListResponse,
	MemoryType,
	RecallSort,
} from "@/lib/types/memory";

export async function listMemories(
	spaceUuid: string,
	options?: {
		limit?: number;
		offset?: number;
		memory_type?: MemoryType | null;
		recall_sort?: RecallSort | null;
	},
): Promise<{ memories: Memory[]; hasMore: boolean }> {
	const limit = options?.limit ?? MEMORIES_PER_PAGE;
	const offset = options?.offset ?? 0;
	const params = new URLSearchParams({
		space_uuid: spaceUuid,
		sort_by: options?.recall_sort ? "access_frequency" : "created_at",
		order: options?.recall_sort === "least" ? "asc" : "desc",
		limit: String(limit),
		offset: String(offset),
	});
	if (options?.memory_type) params.set("memory_type", options.memory_type);

	const data = await apiFetch<MemoryListResponse>(
		`/memories?${params.toString()}`,
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
