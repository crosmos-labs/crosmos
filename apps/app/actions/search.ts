"use server";

import { apiFetch } from "@/lib/api";

export interface SearchResult {
	id: string;
	content: string;
	score: number;
	metadata: Record<string, unknown>;
}

export async function searchMemories(query: string, spaceId?: number) {
	const params = new URLSearchParams({ q: query });
	if (spaceId) params.set("space_id", String(spaceId));

	return apiFetch<SearchResult[]>(`/api/v1/search?${params}`);
}
