import useSWR from "swr";
import { getUsage } from "@/actions/usage";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import type { Usage } from "@/lib/types/usage";

export function usageKey(orgId: string): string {
	return `/orgs/${orgId}/usage`;
}

export function useUsage() {
	const orgId = useActiveOrgId();
	return useSWR<Usage>(orgId ? usageKey(orgId) : null, () => getUsage(), {
		revalidateIfStale: false,
	});
}
