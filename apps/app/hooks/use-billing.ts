import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { getPlans, getSubscription } from "@/actions/billing";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usageKey } from "@/hooks/use-usage";
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

export type ActivationPhase = "finalizing" | "active" | "timeout";

// Polls the subscription until it activates (post-checkout webhook lag), ~30s budget.
export function useSubscriptionActivation(): {
	phase: ActivationPhase;
	subscription: Subscription | undefined;
} {
	const { mutate } = useSWRConfig();
	const orgId = useActiveOrgId();
	const [deadlinePassed, setDeadlinePassed] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setDeadlinePassed(true), 30_000);
		return () => clearTimeout(t);
	}, []);

	const { data } = useSWR<Subscription>(
		orgId ? subscriptionKey(orgId) : null,
		() => getSubscription(),
		{
			refreshInterval: (d) =>
				d?.subscription_status === "active" || deadlinePassed ? 0 : 2000,
			// default 2s would dedupe a poll at this cadence
			dedupingInterval: 0,
			refreshWhenHidden: true,
			onSuccess: (d) => {
				if (d?.subscription_status === "active" && orgId) {
					mutate(usageKey(orgId));
				}
			},
		},
	);

	const phase: ActivationPhase =
		data?.subscription_status === "active"
			? "active"
			: deadlinePassed
				? "timeout"
				: "finalizing";

	return { phase, subscription: data };
}

const PORTAL_RETURN_KEY = "billing:portal-return";

export function markPortalReturn() {
	sessionStorage.setItem(PORTAL_RETURN_KEY, "1");
}

// Portal plan changes land via an async webhook, so refresh a couple of times
// after returning (the mount fetch + revalidateOnFocus only catch an early webhook).
export function usePortalReturnSync() {
	const { mutate } = useSWRConfig();
	const orgId = useActiveOrgId();

	useEffect(() => {
		if (!orgId || sessionStorage.getItem(PORTAL_RETURN_KEY) !== "1") return;

		sessionStorage.removeItem(PORTAL_RETURN_KEY);

		const refresh = () => {
			mutate(subscriptionKey(orgId));
			mutate(usageKey(orgId));
		};

		const timers = [3000, 9000].map((ms) => setTimeout(refresh, ms));

		return () => timers.forEach(clearTimeout);
	}, [orgId, mutate]);
}
