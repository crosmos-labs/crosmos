import useSWR from "swr";
import { getSource } from "@/actions/sources";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { sourcesPrefix } from "@/hooks/use-sources";
import type { Source } from "@/lib/types/source";
import { unwrapAction } from "@/lib/unwrap-action";

export function sourceKey(orgId: string, sourceUuid: string): string {
	return `${sourcesPrefix(orgId)}/${sourceUuid}`;
}

export function useSource(sourceUuid: string | null, spaceUuid: string | null) {
	const orgId = useActiveOrgId();

	return useSWR<Source>(
		orgId && sourceUuid && spaceUuid ? sourceKey(orgId, sourceUuid) : null,
		async () =>
			unwrapAction(await getSource(sourceUuid as string, spaceUuid as string)),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
