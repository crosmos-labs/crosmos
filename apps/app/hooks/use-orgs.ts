import useSWR from "swr";
import { listOrgs } from "@/actions/orgs";
import type { OrgDetailResponse } from "@/lib/types/org";

export const orgsKey = "/orgs";

export function useOrgs() {
	return useSWR<OrgDetailResponse[]>(orgsKey, () => listOrgs(), {
		revalidateIfStale: false,
		revalidateOnFocus: false,
	});
}
