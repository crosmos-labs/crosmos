import useSWR from "swr";
import { listMemories } from "@/actions/memories";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { MEMORIES_PER_PAGE } from "@/lib/params/constants";
import type { Memory } from "@/lib/types/memory";

export interface MemoriesResponse {
	memories: Memory[];
	hasMore: boolean;
}

export function memoriesKey(
	orgId: string,
	spaceUuid: string,
	page: number,
): string {
	return `/orgs/${orgId}/memories?space_uuid=${spaceUuid}&page=${page}`;
}

export function useMemories(spaceUuid: string, page: number = 1) {
	const orgId = useActiveOrgId();
	const offset = (page - 1) * MEMORIES_PER_PAGE;
	return useSWR<MemoriesResponse>(
		orgId && spaceUuid ? memoriesKey(orgId, spaceUuid, page) : null,
		() => listMemories(spaceUuid, { limit: MEMORIES_PER_PAGE, offset }),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
