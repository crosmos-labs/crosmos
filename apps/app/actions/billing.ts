"use server";

import { type ActionResult, toActionError } from "@/lib/action-result";
import { apiFetch } from "@/lib/api";
import type {
	CancelResponse,
	CheckoutResponse,
	PlanInfo,
	PlansResponse,
	PortalResponse,
	PurchasablePlan,
	Subscription,
} from "@/lib/types/billing";

export async function getPlans(): Promise<PlanInfo[]> {
	const data = await apiFetch<PlansResponse>("/billing/plans");
	return data.plans;
}

export async function getSubscription(): Promise<Subscription> {
	return apiFetch<Subscription>("/billing/subscription");
}

export async function startCheckout(
	plan: PurchasablePlan,
): Promise<ActionResult<CheckoutResponse>> {
	try {
		const data = await apiFetch<CheckoutResponse>("/billing/checkout", {
			method: "POST",
			body: JSON.stringify({ plan }),
		});
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}

export async function openPortal(): Promise<ActionResult<PortalResponse>> {
	try {
		const data = await apiFetch<PortalResponse>("/billing/portal", {
			method: "POST",
		});
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}

export async function cancelSubscription(): Promise<
	ActionResult<CancelResponse>
> {
	try {
		const data = await apiFetch<CancelResponse>("/billing/cancel", {
			method: "POST",
		});
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}
