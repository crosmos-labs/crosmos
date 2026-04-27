import useSWR from "swr";
import { listMemories } from "@/actions/memories";
import type { Memory } from "@/lib/types/memory";

export function useMemories(spaceUuid: string) {
	return useSWR<Memory[]>(
		spaceUuid ? `/memories?space_uuid=${spaceUuid}` : null,
		() => listMemories(spaceUuid),
		{
			keepPreviousData: true,
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
