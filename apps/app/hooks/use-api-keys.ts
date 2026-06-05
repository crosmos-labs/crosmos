import useSWR from "swr";
import { listApiKeys } from "@/actions/api-keys";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import type { ApiKey } from "@/lib/types/api-key";

export function apiKeysKey(orgId: string): string {
	return `/orgs/${orgId}/api-keys`;
}

export function useApiKeys() {
	const orgId = useActiveOrgId();
	return useSWR<ApiKey[]>(
		orgId ? apiKeysKey(orgId) : null,
		() => listApiKeys(),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
