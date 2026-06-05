import useSWR from "swr";
import { getGraphViewport } from "@/actions/graph";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import type { GraphViewportResponse } from "@/lib/types/graph";

export function graphKey(orgId: string, spaceUuid: string): string {
	return `/orgs/${orgId}/graph?space_uuid=${spaceUuid}`;
}

export function useGraph(spaceUuid: string | null) {
	const orgId = useActiveOrgId();
	return useSWR<GraphViewportResponse>(
		orgId && spaceUuid ? graphKey(orgId, spaceUuid) : null,
		() => getGraphViewport(spaceUuid as string),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
