import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { getPayments, getPlans, getSubscription } from "@/actions/billing";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { useOrgRole } from "@/hooks/use-org-role";
import { usageKey } from "@/hooks/use-usage";
import type {
	PaymentsResponse,
	PlanInfo,
	Subscription,
} from "@/lib/types/billing";

export function plansKey(orgId: string): string {
	return `/orgs/${orgId}/billing/plans`;
}

export function subscriptionKey(orgId: string): string {
	return `/orgs/${orgId}/billing/subscription`;
}

// Role-gated like useSubscription: members never render plans, so skip the fetch.
export function usePlans() {
	const { orgId, isOwnerAdmin } = useOrgRole();

	return useSWR<PlanInfo[]>(
		orgId && isOwnerAdmin ? plansKey(orgId) : null,
		() => getPlans(),
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}

// Subscription reads are owner/admin only; gate the fetch by role so members
// never trigger a 403 (the member view is driven by role, not by the error).
export function useSubscription() {
	const { orgId, isOwnerAdmin } = useOrgRole();

	return useSWR<Subscription>(
		orgId && isOwnerAdmin ? subscriptionKey(orgId) : null,
		() => getSubscription(),
		{ revalidateIfStale: false, revalidateOnFocus: true },
	);
}

export function paymentsKey(orgId: string, page: number): string {
	return `/orgs/${orgId}/billing/payments?page=${page}`;
}

export function usePayments(page: number) {
	const { orgId, isOwnerAdmin } = useOrgRole();

	return useSWR<PaymentsResponse>(
		orgId && isOwnerAdmin ? paymentsKey(orgId, page) : null,
		() => getPayments(page),
		{ revalidateOnFocus: false, keepPreviousData: true },
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

	// Start the budget once polling can actually begin (orgId gates the SWR key).
	useEffect(() => {
		if (!orgId) return;
		const t = setTimeout(() => setDeadlinePassed(true), 30_000);
		return () => clearTimeout(t);
	}, [orgId]);

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

		// Consume the flag only when a refresh runs, so navigating away before
		// the first timer re-arms the sync on the next /billing visit.
		const refresh = () => {
			sessionStorage.removeItem(PORTAL_RETURN_KEY);
			mutate(subscriptionKey(orgId));
			mutate(usageKey(orgId));
		};

		const timers = [3000, 9000].map((ms) => setTimeout(refresh, ms));

		return () => timers.forEach(clearTimeout);
	}, [orgId, mutate]);
}
