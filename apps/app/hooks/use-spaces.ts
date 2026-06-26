import useSWR from "swr";
import { listSpaces } from "@/actions/spaces";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { byCreatedAtDesc } from "@/lib/sort";
import type { Space } from "@/lib/types/space";

export function spacesKey(orgId: string): string {
	return `/orgs/${orgId}/spaces`;
}

export function useSpaces() {
	const orgId = useActiveOrgId();
	return useSWR<Space[]>(
		orgId ? spacesKey(orgId) : null,
		// Newest-first so optimistic top-inserts match the order after refetch (API returns created_at ASC).
		async () => byCreatedAtDesc(await listSpaces()),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
