import useSWR from "swr";
import { listSpaces } from "@/actions/spaces";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import type { Space } from "@/lib/types/space";

export function spacesKey(orgId: string): string {
	return `/orgs/${orgId}/spaces`;
}

export function useSpaces() {
	const orgId = useActiveOrgId();
	return useSWR<Space[]>(orgId ? spacesKey(orgId) : null, () => listSpaces(), {
		revalidateIfStale: false,
		revalidateOnFocus: false,
	});
}
