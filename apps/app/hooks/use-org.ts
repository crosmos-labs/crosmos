import useSWR from "swr";
import { getOrg } from "@/actions/orgs";
import type { OrgDetailResponse } from "@/lib/types/org";

export function orgKey(orgId: string): string {
	return `/orgs/${orgId}`;
}

export function useOrg(orgId: string | null | undefined) {
	return useSWR<OrgDetailResponse>(
		orgId ? orgKey(orgId) : null,
		() => getOrg(orgId as string),
		{
			keepPreviousData: true,
			revalidateOnFocus: true,
		},
	);
}
