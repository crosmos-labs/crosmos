"use server";

import { apiFetch } from "@/lib/api";
import type {
	GraphStatsResponse,
	GraphViewportResponse,
} from "@/lib/types/graph";

export async function getGraphViewport(
	spaceUuid: string,
	options?: { limit?: number; offset?: number },
): Promise<GraphViewportResponse> {
	const limit = options?.limit ?? 100;
	const offset = options?.offset ?? 0;
	return apiFetch<GraphViewportResponse>(
		`/graph?space_uuid=${spaceUuid}&limit=${limit}&offset=${offset}`,
	);
}

export async function getGraphStats(
	spaceUuid: string,
): Promise<GraphStatsResponse> {
	return apiFetch<GraphStatsResponse>(`/graph/stats?space_uuid=${spaceUuid}`);
}
