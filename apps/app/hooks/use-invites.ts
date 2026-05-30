import useSWR from "swr";
import { listInvites } from "@/actions/members";
import type { InviteResponse } from "@/lib/types/org";

export function invitesKey(orgId: string): string {
	return `/orgs/${orgId}/invites`;
}

export function useInvites(orgId: string | null | undefined, enabled = true) {
	return useSWR<InviteResponse[]>(
		orgId && enabled ? invitesKey(orgId) : null,
		() => listInvites(orgId as string),
		{
			keepPreviousData: true,
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
