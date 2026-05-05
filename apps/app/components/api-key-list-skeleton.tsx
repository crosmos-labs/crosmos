"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";

function SkeletonRow() {
	return (
		<Item variant="outline" className="px-4 py-3.5">
			<ItemContent>
				<ItemTitle className="flex items-center gap-2 text-base">
					<Skeleton className="h-4 w-28" />
				</ItemTitle>
				<ItemDescription>
					<span className="inline-block animate-pulse rounded-md bg-muted h-3 w-48 font-mono" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-3 w-20" />
			</ItemActions>
		</Item>
	);
}

export function ApiKeyListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-8 w-20" />
			</div>
			{["a", "b", "c"].map((k) => (
				<SkeletonRow key={k} />
			))}
			<span className="sr-only">Loading API keys…</span>
		</div>
	);
}
