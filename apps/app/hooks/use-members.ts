import useSWR from "swr";
import { listMembers } from "@/actions/members";
import type { MemberResponse } from "@/lib/types/org";

export function membersKey(orgId: string): string {
	return `/orgs/${orgId}/members`;
}

export function useMembers(orgId: string | null | undefined) {
	return useSWR<MemberResponse[]>(
		orgId ? membersKey(orgId) : null,
		() => listMembers(orgId as string),
		{
			keepPreviousData: true,
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
