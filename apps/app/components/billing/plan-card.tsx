"use client";

import { Button } from "@crosmos/ui/components/button";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import { IconCheck } from "@tabler/icons-react";
import { PlanIcon } from "@/components/billing/plan-icon";
import { capitalize, formatNumber } from "@/lib/format";
import type { PlanInfo } from "@/lib/types/billing";

function limitLabel(n: number): string {
	return n === -1 ? "Unlimited" : formatNumber(n);
}

function priceLabel(priceUsd: number): string {
	return priceUsd === 0 ? "Free" : `$${priceUsd}/mo`;
}

export function PlanCard({
	plan,
	isCurrent,
	isBusy,
	canUpgrade,
	onUpgrade,
}: {
	plan: PlanInfo;
	isCurrent: boolean;
	isBusy: boolean;
	canUpgrade: boolean;
	onUpgrade: () => void;
}) {
	const rows = [
		`${limitLabel(plan.max_memory_spaces)} memory spaces`,
		`${limitLabel(plan.monthly_tokens_ingested)} tokens / mo`,
		`${limitLabel(plan.monthly_search_queries)} searches / mo`,
	];

	return (
		<div
			className={cn(
				"flex flex-col gap-4 rounded-2xl p-4",
				isCurrent && "border bg-background",
			)}
		>
			<div className="flex items-center gap-2.5">
				<PlanIcon plan={plan.plan} />
				<span className="font-medium">{capitalize(plan.plan)} plan</span>
				<span className="ml-auto text-base text-muted-foreground">
					{priceLabel(plan.price_usd)}
				</span>
			</div>
			<ul className="flex flex-col gap-2">
				{rows.map((row) => (
					<li
						key={row}
						className="flex items-center gap-2 text-sm text-muted-foreground"
					>
						<IconCheck className="size-4 shrink-0" />
						{row}
					</li>
				))}
			</ul>
			<div className="mt-auto">
				{isCurrent ? (
					<Button variant="outline" className="w-full" disabled>
						Current plan
					</Button>
				) : (
					<Button
						className="w-full"
						disabled={isBusy || !canUpgrade}
						onClick={onUpgrade}
					>
						Upgrade
					</Button>
				)}
			</div>
		</div>
	);
}

export function PlanCardSkeleton() {
	return (
		<div className="flex flex-col gap-4 rounded-lg p-4">
			<div className="flex items-center gap-2.5">
				<Skeleton className="size-7 rounded-full" />
				<Skeleton className="h-4 w-24" />
				<Skeleton className="ml-auto h-4 w-12" />
			</div>
			<div className="flex flex-col gap-2">
				<Skeleton className="h-4 w-4/5" />
				<Skeleton className="h-4 w-3/5" />
				<Skeleton className="h-4 w-3/4" />
			</div>
			<Skeleton className="mt-auto h-9 w-full" />
		</div>
	);
}
