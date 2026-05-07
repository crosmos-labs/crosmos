import useSWR from "swr";
import { getGraphViewport } from "@/actions/graph";
import type { GraphViewportResponse } from "@/lib/types/graph";

export function useGraph(spaceUuid: string | null) {
	return useSWR<GraphViewportResponse>(
		spaceUuid ? `/graph?space_uuid=${spaceUuid}` : null,
		() => getGraphViewport(spaceUuid as string),
		{
			keepPreviousData: true,
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
