"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";
import { PlansSection } from "@/components/billing/plans-section";
import { SpacesMeter } from "@/components/billing/spaces-meter";
import { SubscriptionPanel } from "@/components/billing/subscription-panel";
import { UsageMeter } from "@/components/billing/usage-meter";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import {
	usePlans,
	usePortalReturnSync,
	useSubscription,
} from "@/hooks/use-billing";
import { useOrgRole } from "@/hooks/use-org-role";
import { useUsage } from "@/hooks/use-usage";
import { capitalize, formatDate } from "@/lib/format";

export default function BillingPage() {
	const { user, orgId, role, isOwnerAdmin } = useOrgRole();
	const canManageBilling = isOwnerAdmin;

	usePortalReturnSync();

	const {
		data: usage,
		isLoading: usageLoading,
		error: usageError,
		mutate: reloadUsage,
	} = useUsage();
	const {
		data: subscription,
		isLoading: subLoading,
		error: subError,
		mutate: reloadSubscription,
	} = useSubscription();
	const { data: plans, isLoading: plansLoading } = usePlans();

	const plan = usage?.plan ?? "free";
	const periodLabel =
		usage?.period_start && usage?.period_end
			? `${formatDate(usage.period_start)} – ${formatDate(usage.period_end)}`
			: undefined;

	// Only surface an error when its data is missing: a failed background
	// revalidation keeps the rendered page instead of tearing it down.
	const error =
		(!usage ? usageError : undefined) ??
		(canManageBilling && !subscription ? subError : undefined);
	// One combined loading gate: wait for subscription AND plans together so the
	// plan cards never flash a second skeleton after the page skeleton.
	const loading =
		!user ||
		!orgId ||
		(usageLoading && !usage) ||
		(canManageBilling &&
			((subLoading && !subscription) || (plansLoading && !plans)));

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
				<p className="text-sm text-muted-foreground">
					Manage your subscription plan and view usage.
				</p>
			</div>
			{error ? (
				<DataFetchError
					message={error.message}
					onRetry={() => (usageError ? reloadUsage() : reloadSubscription())}
				/>
			) : loading ? (
				<BillingSkeleton showPlans={canManageBilling} />
			) : (
				<>
					{canManageBilling && subscription ? (
						<SubscriptionPanel
							subscription={subscription}
							canManage={role === "owner"}
						/>
					) : plan !== "free" ? (
						<ItemGroup>
							<Item variant="outline" className="px-4 py-3.5">
								<ItemContent>
									<ItemTitle className="text-base">
										{capitalize(plan)} plan
									</ItemTitle>
									<ItemDescription>Your current plan.</ItemDescription>
								</ItemContent>
							</Item>
						</ItemGroup>
					) : null}
					{canManageBilling && subscription && (
						<PlansSection currentPlan={subscription.plan} />
					)}
					{usage && (
						<div className="flex flex-col gap-6">
							<div className="flex flex-col gap-1">
								<h2 className="text-lg font-semibold tracking-tight">Usage</h2>
								<p className="text-sm text-muted-foreground">
									Your resource usage this billing period
									{periodLabel ? ` (${periodLabel})` : ""}.
								</p>
							</div>
							<div className="flex flex-col gap-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<UsageMeter
										label="Tokens ingested"
										used={usage.tokens.used}
										limit={usage.tokens.limit}
										periodStart={usage.period_start}
										periodEnd={usage.period_end}
									/>
									<UsageMeter
										label="Search queries"
										used={usage.queries.used}
										limit={usage.queries.limit}
										periodStart={usage.period_start}
										periodEnd={usage.period_end}
									/>
								</div>
								<SpacesMeter
									used={usage.spaces.used}
									limit={usage.spaces.limit}
								/>
								<p className="text-xs text-muted-foreground">
									Rate limits: {usage.rate_limit_rpm} req/min ·{" "}
									{usage.rate_limit_per_day.toLocaleString()} req/day
								</p>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
