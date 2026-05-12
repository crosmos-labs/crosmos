"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";

function SkeletonMemoryRow() {
	return (
		<Item variant="outline" className="px-4 py-3.5">
			<ItemContent>
				<ItemTitle className="text-base">
					<Skeleton className="h-4 w-16" />
				</ItemTitle>
				<ItemDescription>
					<span className="inline-block animate-pulse rounded-md bg-muted h-3.5 w-3/4" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-3 w-20" />
			</ItemActions>
		</Item>
	);
}

export function SpaceDetailSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<Skeleton className="h-7 w-40" />
				<Skeleton className="h-4 w-56" />
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-20" />
				</div>
				{["a", "b", "c", "d", "e"].map((k) => (
					<SkeletonMemoryRow key={k} />
				))}
			</div>
			<span className="sr-only">Loading space details…</span>
		</div>
	);
}
