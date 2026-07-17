import useSWR from "swr";
import { listMemories } from "@/actions/memories";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { MEMORIES_PER_PAGE } from "@/lib/params/constants";
import type { Memory, MemoryType, RecallSort } from "@/lib/types/memory";

export interface MemoriesResponse {
	memories: Memory[];
	hasMore: boolean;
}

export interface MemoriesOptions {
	memory_type: MemoryType | null;
	recall_sort: RecallSort | null;
}

export function memoriesPrefix(orgId: string): string {
	return `/orgs/${orgId}/memories`;
}

export function memoriesKey(
	orgId: string,
	spaceUuid: string,
	page: number,
	options: MemoriesOptions = { memory_type: null, recall_sort: null },
): string {
	const params = new URLSearchParams({
		space_uuid: spaceUuid,
		page: String(page),
		memory_type: options.memory_type ?? "all",
		recall_sort: options.recall_sort ?? "default",
	});
	return `${memoriesPrefix(orgId)}?${params.toString()}`;
}

export function useMemories(
	spaceUuid: string,
	page: number = 1,
	options: MemoriesOptions = { memory_type: null, recall_sort: null },
) {
	const orgId = useActiveOrgId();
	const offset = (page - 1) * MEMORIES_PER_PAGE;
	return useSWR<MemoriesResponse>(
		orgId && spaceUuid ? memoriesKey(orgId, spaceUuid, page, options) : null,
		() =>
			listMemories(spaceUuid, {
				limit: MEMORIES_PER_PAGE,
				offset,
				...options,
			}),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
			keepPreviousData: true,
		},
	);
}
