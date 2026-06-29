import useSWR from "swr";
import { getPlans, getSubscription } from "@/actions/billing";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { PlanInfo, Subscription } from "@/lib/types/billing";

export function plansKey(orgId: string): string {
	return `/orgs/${orgId}/billing/plans`;
}

export function subscriptionKey(orgId: string): string {
	return `/orgs/${orgId}/billing/subscription`;
}

export function usePlans() {
	const orgId = useActiveOrgId();
	return useSWR<PlanInfo[]>(orgId ? plansKey(orgId) : null, () => getPlans(), {
		revalidateIfStale: false,
		revalidateOnFocus: false,
	});
}

// Subscription reads are owner/admin only; gate the fetch by role so members
// never trigger a 403 (the member view is driven by role, not by the error).
export function useSubscription() {
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const role = user?.active_org?.your_role ?? null;
	const canRead = role === "owner" || role === "admin";
	return useSWR<Subscription>(
		orgId && canRead ? subscriptionKey(orgId) : null,
		() => getSubscription(),
		{ revalidateIfStale: false, revalidateOnFocus: true },
	);
}
