"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";

function SkeletonMeter() {
	return (
		<div className="flex flex-col gap-2 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-8" />
			</div>
			<Skeleton className="h-4 w-28" />
			<Skeleton className="h-2 w-full rounded-full" />
			<Skeleton className="h-3 w-32" />
		</div>
	);
}

function SkeletonSpaces() {
	return (
		<div className="flex flex-col gap-3 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-28" />
			</div>
			<div className="flex flex-wrap gap-1.5">
				{Array.from({ length: 10 }, (_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-order static pips
					<Skeleton key={i} className="size-3 rounded-full" />
				))}
			</div>
			<Skeleton className="h-3 w-24" />
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
					<ItemDescription as="div">
						<Skeleton className="h-3.5 w-4/5" />
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
				<div className="flex flex-col gap-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<SkeletonMeter />
						<SkeletonMeter />
					</div>
					<SkeletonSpaces />
				</div>
			</div>
			<span className="sr-only">Loading billing data…</span>
		</div>
	);
}
