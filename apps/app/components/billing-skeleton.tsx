"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";

function SkeletonUsageRow() {
	return (
		<div>
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-0.5">
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="flex items-center gap-3">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-10" />
				</div>
			</div>
			<Skeleton className="mt-2 h-2 w-full rounded-full" />
		</div>
	);
}

export function BillingSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<Item variant="outline" className="px-4 py-3.5">
				<ItemContent>
					<ItemTitle className="flex items-center gap-2 text-base">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-5 w-12 rounded-full" />
					</ItemTitle>
					<ItemDescription>
						<span className="inline-block animate-pulse rounded-md bg-muted h-3.5 w-4/5" />
					</ItemDescription>
				</ItemContent>
				<ItemActions>
					<Skeleton className="h-8 w-20" />
				</ItemActions>
			</Item>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<Skeleton className="h-5 w-12" />
					<Skeleton className="h-4 w-64" />
				</div>
				<div className="flex flex-col gap-6">
					<SkeletonUsageRow />
					<SkeletonUsageRow />
					<SkeletonUsageRow />
				</div>
			</div>
			<span className="sr-only">Loading billing data…</span>
		</div>
	);
}
