import useSWR from "swr";
import { searchMemories, type SearchResult } from "@/actions/search";

export function useSearch(query: string, spaceId?: number) {
	return useSWR<SearchResult[]>(
		query.length > 1 ? ["search", query, spaceId] : null,
		() => searchMemories(query, spaceId),
		{ dedupingInterval: 300 },
	);
}
