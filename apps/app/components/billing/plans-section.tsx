"use client";

import { Button } from "@crosmos/ui/components/button";
import { IconArrowUpRight } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { startCheckout } from "@/actions/billing";
import { BillingEmailDialog } from "@/components/billing/billing-email-dialog";
import { PlanCard, PlanCardSkeleton } from "@/components/billing/plan-card";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { subscriptionKey, usePlans } from "@/hooks/use-billing";
import { useCalApi } from "@/hooks/use-cal-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useOrg } from "@/hooks/use-org";
import {
	PLAN_ORDER,
	type Plan,
	type PurchasablePlan,
} from "@/lib/types/billing";

const SALES_CAL_NAMESPACE = "30min";
const SALES_CAL_LINK = "crosmos/30min";

export function PlansSection({ currentPlan }: { currentPlan: Plan }) {
	const { data: plans, isLoading, error, mutate: reloadPlans } = usePlans();
	const { data: user } = useCurrentUser();
	const initCal = useCalApi(SALES_CAL_NAMESPACE);
	const canUpgrade =
		user?.active_org?.your_role === "owner" && currentPlan === "free";
	const orgId = user?.active_org_id ?? null;
	const { data: org } = useOrg(orgId);
	const { mutate } = useSWRConfig();
	const { runAction, state } = useActionLoader();
	const busy = state.activeCount > 0;

	const [emailDialogPlan, setEmailDialogPlan] =
		useState<PurchasablePlan | null>(null);

	async function doCheckout(plan: PurchasablePlan) {
		try {
			await runAction(async () => {
				const res = await startCheckout(plan);
				if (!res.ok) throw new Error(res.message);
				if (!res.data.checkout_url) throw new Error("missing_checkout_url");
				window.location.assign(res.data.checkout_url);
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "";
			if (msg.includes("billing_email")) {
				setEmailDialogPlan(plan);
			} else if (msg.includes("rate_limited")) {
				toast.error("Too many upgrade attempts. Try again shortly.");
			} else if (msg.includes("provider_error")) {
				toast.error("Payment provider error. Please try again.");
			} else if (msg.includes("already on plan")) {
				toast.error("You're already on this plan.");
				if (orgId) mutate(subscriptionKey(orgId));
			} else {
				toast.error("Couldn't start checkout. Please try again.");
			}
		}
	}

	function onUpgrade(plan: PurchasablePlan) {
		if (!canUpgrade) return;
		if (org && !org.billing_email) {
			setEmailDialogPlan(plan);
			return;
		}
		doCheckout(plan);
	}

	const hasComingSoon = plans?.some((p) => p.status === "coming_soon") ?? false;

	const salesCalConfig = useMemo(
		() =>
			JSON.stringify({
				layout: "month_view",
				useSlotsViewOnSmallScreen: "true",
				...(user?.name ? { name: user.name } : {}),
				...(user?.email ? { email: user.email } : {}),
			}),
		[user?.name, user?.email],
	);

	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-lg font-semibold tracking-tight">
					Change your plan
				</h2>
				{hasComingSoon && (
					<Button
						variant="ghost"
						size="sm"
						data-cal-namespace={SALES_CAL_NAMESPACE}
						data-cal-link={SALES_CAL_LINK}
						data-cal-config={salesCalConfig}
						onPointerEnter={initCal}
						onFocus={initCal}
					>
						Talk to sales about Enterprise
						<IconArrowUpRight data-icon="inline-end" />
					</Button>
				)}
			</div>
			<div className="grid gap-3 sm:grid-cols-3">
				{error ? (
					<div className="col-span-full flex flex-col items-start gap-2 p-4">
						<p className="text-sm text-muted-foreground">
							Couldn't load plans.
						</p>
						<Button variant="outline" size="sm" onClick={() => reloadPlans()}>
							Try again
						</Button>
					</div>
				) : isLoading || !plans ? (
					<>
						<PlanCardSkeleton />
						<PlanCardSkeleton />
						<PlanCardSkeleton />
					</>
				) : (
					plans
						.filter((p) => p.status === "live")
						.sort(
							(a, b) => PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan),
						)
						.map((p) => (
							<PlanCard
								key={p.plan}
								plan={p}
								isCurrent={p.plan === currentPlan}
								isBusy={busy}
								canUpgrade={canUpgrade}
								onUpgrade={() => onUpgrade(p.plan as PurchasablePlan)}
							/>
						))
				)}
			</div>
			<BillingEmailDialog
				open={emailDialogPlan !== null}
				onOpenChange={(open) => {
					if (!open) setEmailDialogPlan(null);
				}}
				onSaved={() => {
					if (emailDialogPlan) doCheckout(emailDialogPlan);
				}}
			/>
		</section>
	);
}
