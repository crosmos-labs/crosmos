import useSWR from "swr";
import { listMemories } from "@/actions/memories";
import { MEMORIES_PER_PAGE } from "@/lib/params/constants";
import type { Memory } from "@/lib/types/memory";

export interface MemoriesResponse {
	memories: Memory[];
	hasMore: boolean;
}

export function useMemories(spaceUuid: string, page: number = 1) {
	const offset = (page - 1) * MEMORIES_PER_PAGE;
	return useSWR<MemoriesResponse>(
		spaceUuid ? `/memories?space_uuid=${spaceUuid}&page=${page}` : null,
		() => listMemories(spaceUuid, { limit: MEMORIES_PER_PAGE, offset }),
		{
			keepPreviousData: true,
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
