"use client";

import { Skeleton } from "@crosmos/ui/components/skeleton";
import { PlanCardsSkeleton } from "@/components/billing/plan-cards";
import { SpacesMeterSkeleton } from "@/components/billing/spaces-meter";
import { StatusStripSkeleton } from "@/components/billing/status-strip";
import { UsageMeterSkeleton } from "@/components/billing/usage-meter";

export function BillingSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<StatusStripSkeleton />
			<PlanCardsSkeleton />
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<Skeleton className="h-5 w-12" />
					<Skeleton className="h-4 w-64" />
				</div>
				<div className="flex flex-col gap-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<UsageMeterSkeleton />
						<UsageMeterSkeleton />
					</div>
					<SpacesMeterSkeleton />
				</div>
			</div>
			<span className="sr-only">Loading billing data…</span>
		</div>
	);
}
