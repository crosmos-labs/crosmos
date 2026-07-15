"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@crosmos/ui/components/dialog";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { startCheckout } from "@/actions/billing";
import { BillingEmailDialog } from "@/components/billing/billing-email-dialog";
import { EnterpriseSalesButton } from "@/components/billing/enterprise-sales-button";
import { PlanIcon } from "@/components/billing/plan-icon";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { subscriptionKey, usePlans } from "@/hooks/use-billing";
import { useOrg } from "@/hooks/use-org";
import { useOrgRole } from "@/hooks/use-org-role";
import { toastBillingError } from "@/lib/billing-errors";
import { capitalize, formatNumber } from "@/lib/format";
import {
	PLAN_ORDER,
	type PlanInfo,
	type PurchasablePlan,
} from "@/lib/types/billing";

function limitLabel(n: number): string {
	return n === -1 ? "Unlimited" : formatNumber(n);
}

function planLimits(plan: PlanInfo): string {
	return [
		`${limitLabel(plan.max_memory_spaces)} memory spaces`,
		`${limitLabel(plan.monthly_tokens_ingested)} tokens/mo`,
		`${limitLabel(plan.monthly_search_queries)} searches/mo`,
	].join(" · ");
}

export function UpgradePlanDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: plans, isLoading, error, mutate: reloadPlans } = usePlans();
	const { orgId } = useOrgRole();
	const { data: org } = useOrg(orgId);
	const { mutate } = useSWRConfig();
	const { runAction, state } = useActionLoader();

	const [redirecting, setRedirecting] = useState(false);
	const busy = state.activeCount > 0 || redirecting;

	const [emailDialogPlan, setEmailDialogPlan] =
		useState<PurchasablePlan | null>(null);

	async function doCheckout(plan: PurchasablePlan) {
		try {
			await runAction(async () => {
				const res = await startCheckout(plan);
				if (!res.ok) throw new Error(res.message);
				if (!res.data.checkout_url) throw new Error("missing_checkout_url");
				setRedirecting(true);
				window.location.assign(res.data.checkout_url);
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "";
			if (msg.includes("billing_email")) {
				onOpenChange(false);
				setEmailDialogPlan(plan);
			} else if (msg.includes("already on plan")) {
				toast.error("You're already on this plan.");
				if (orgId) mutate(subscriptionKey(orgId));
			} else {
				toastBillingError(err, "Couldn't start checkout. Please try again.");
			}
		}
	}

	function onSelect(plan: PurchasablePlan) {
		if (org && !org.billing_email) {
			onOpenChange(false);
			setEmailDialogPlan(plan);
			return;
		}
		doCheckout(plan);
	}

	const hasComingSoon = plans?.some((p) => p.status === "coming_soon") ?? false;

	return (
		<>
			<Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Upgrade your plan</DialogTitle>
						<DialogDescription>
							Pick the plan that fits your workload.
						</DialogDescription>
					</DialogHeader>
					{error ? (
						<div className="flex flex-col items-start gap-2 py-2">
							<p className="text-sm text-muted-foreground">
								Couldn't load plans.
							</p>
							<Button variant="outline" size="sm" onClick={() => reloadPlans()}>
								Try again
							</Button>
						</div>
					) : isLoading || !plans ? (
						<div className="flex flex-col gap-2">
							<Skeleton className="h-16 w-full rounded-lg" />
							<Skeleton className="h-16 w-full rounded-lg" />
							<Skeleton className="h-16 w-full rounded-lg" />
						</div>
					) : (
						<ItemGroup>
							{plans
								.filter((p) => p.status === "live")
								.sort(
									(a, b) =>
										PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan),
								)
								.map((p) => (
									<Item key={p.plan} variant="outline" className="px-4 py-3.5">
										<ItemMedia>
											<PlanIcon plan={p.plan} />
										</ItemMedia>
										<ItemContent>
											<ItemTitle>{capitalize(p.plan)} plan</ItemTitle>
											<ItemDescription>{planLimits(p)}</ItemDescription>
										</ItemContent>
										<ItemActions>
											{p.plan === "free" ? (
												<Button variant="outline" size="sm" disabled>
													Current plan
												</Button>
											) : (
												<Button
													size="sm"
													disabled={busy}
													onClick={() => onSelect(p.plan as PurchasablePlan)}
												>
													Select
												</Button>
											)}
										</ItemActions>
									</Item>
								))}
						</ItemGroup>
					)}
					{hasComingSoon && (
						<EnterpriseSalesButton
							className="justify-self-end"
							// Close first: this dialog's modal body lock would leave
							// Cal's body-mounted modal inert (pointer-events: none).
							onClick={() => onOpenChange(false)}
						/>
					)}
				</DialogContent>
			</Dialog>
			<BillingEmailDialog
				open={emailDialogPlan !== null}
				onOpenChange={(o) => {
					if (!o) setEmailDialogPlan(null);
				}}
				onSaved={() => {
					if (emailDialogPlan) doCheckout(emailDialogPlan);
				}}
			/>
		</>
	);
}
