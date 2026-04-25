"use server";

import { apiFetch } from "@/lib/api";
import type { SearchResponse } from "@/lib/types/search";

export async function searchMemories(query: string, spaceId?: string) {
	const params = new URLSearchParams({ q: query });
	if (spaceId) params.set("space_id", spaceId);

	const data = await apiFetch<SearchResponse>(`/search?${params}`);
	return data.candidates;
}
