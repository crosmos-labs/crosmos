"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { useSWRConfig } from "swr";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";
import { PlansSection } from "@/components/billing/plans-section";
import { SpacesMeter } from "@/components/billing/spaces-meter";
import { SubscriptionPanel } from "@/components/billing/subscription-panel";
import { UsageMeter } from "@/components/billing/usage-meter";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import {
	usePlans,
	usePortalReturnSync,
	useSubscription,
} from "@/hooks/use-billing";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usageKey, useUsage } from "@/hooks/use-usage";
import { capitalize, formatDate } from "@/lib/format";

export default function BillingPage() {
	const { mutate } = useSWRConfig();
	const orgId = useActiveOrgId();
	const { data: user } = useCurrentUser();
	const role = user?.active_org?.your_role ?? null;
	const canManageBilling = role === "owner" || role === "admin";

	usePortalReturnSync();

	const {
		data: usage,
		isLoading: usageLoading,
		error: usageError,
	} = useUsage();
	const {
		data: subscription,
		isLoading: subLoading,
		error: subError,
	} = useSubscription();
	const { data: plans, isLoading: plansLoading } = usePlans();

	const swrKey = orgId ? usageKey(orgId) : null;

	const plan = usage?.plan ?? "free";
	const periodLabel =
		usage?.period_start && usage?.period_end
			? `${formatDate(usage.period_start)} – ${formatDate(usage.period_end)}`
			: undefined;

	const error = usageError ?? (canManageBilling ? subError : undefined);
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
					onRetry={() => (swrKey ? mutate(swrKey) : Promise.resolve())}
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
					{(role === "owner" || role === "admin") && subscription && (
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
