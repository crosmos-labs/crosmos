import useSWR from "swr";
import { searchMemories } from "@/actions/search";
import type { MemoryCandidate } from "@/lib/types/search";

export function useSearch(query: string, spaceId?: number) {
	return useSWR<MemoryCandidate[]>(
		query.length > 1 ? ["search", query, spaceId] : null,
		() => searchMemories(query, spaceId),
		{ dedupingInterval: 300 },
	);
}
