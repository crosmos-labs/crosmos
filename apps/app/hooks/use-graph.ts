import useSWR from "swr";
import { getGraphViewport } from "@/actions/graph";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import type { GraphViewportResponse } from "@/lib/graph/wire";

export function graphPrefix(orgId: string): string {
	return `/orgs/${orgId}/graph`;
}

export function graphKey(orgId: string, spaceUuid: string): string {
	return `${graphPrefix(orgId)}?space_uuid=${spaceUuid}`;
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
