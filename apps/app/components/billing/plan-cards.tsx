"use client";

import { Card } from "@crosmos/ui/components/card";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { PlanCard } from "@/components/billing/plan-card";
import {
	PLAN_ORDER,
	type Plan,
	type PlanInfo,
	type PurchasablePlan,
	RECOMMENDED_PLAN,
	type Subscription,
} from "@/lib/types/billing";
import type { OrgRole } from "@/lib/types/org";

const LIVE_STATUSES = new Set<Subscription["subscription_status"]>([
	"active",
	"past_due",
	"canceled",
]);

function planRank(plan: Plan): number {
	const i = PLAN_ORDER.indexOf(plan);
	return i === -1 ? PLAN_ORDER.length : i;
}

export function PlanCards({
	plans,
	currentPlan,
	subscription,
	role,
	busy,
	onUpgrade,
	onManage,
}: {
	plans: PlanInfo[];
	currentPlan: Plan;
	subscription: Subscription | null;
	role: OrgRole | null;
	busy: boolean;
	onUpgrade: (plan: PurchasablePlan) => void;
	onManage: () => void;
}) {
	const sorted = [...plans].sort((a, b) => planRank(a.plan) - planRank(b.plan));
	const hasLiveSub = subscription
		? LIVE_STATUSES.has(subscription.subscription_status)
		: false;
	const isOwner = role === "owner";

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{sorted.map((plan) => (
				<PlanCard
					key={plan.plan}
					plan={plan}
					isCurrent={plan.plan === currentPlan}
					isRecommended={plan.plan === RECOMMENDED_PLAN}
					hasLiveSub={hasLiveSub}
					isOwner={isOwner}
					busy={busy}
					onUpgrade={onUpgrade}
					onManage={onManage}
				/>
			))}
		</div>
	);
}

export function PlanCardsSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{["free", "developer", "pro", "enterprise"].map((k) => (
				<Card key={k} size="sm" className="gap-4">
					<div className="flex flex-col gap-2 px-3">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-5 w-16" />
					</div>
					<div className="flex flex-col gap-2 px-3">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-4 w-30" />
						<Skeleton className="mt-2 h-8 w-full" />
					</div>
				</Card>
			))}
		</div>
	);
}
