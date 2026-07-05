import useSWR from "swr";
import { getSource } from "@/actions/sources";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import type { Source } from "@/lib/types/source";

function sourceKey(orgId: string, sourceUuid: string): string {
	return `/orgs/${orgId}/sources/${sourceUuid}`;
}

export function useSource(sourceUuid: string | null, spaceUuid: string | null) {
	const orgId = useActiveOrgId();

	return useSWR<Source>(
		orgId && sourceUuid && spaceUuid ? sourceKey(orgId, sourceUuid) : null,
		() => getSource(sourceUuid as string, spaceUuid as string),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
