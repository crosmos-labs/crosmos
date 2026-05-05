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
				<ItemTitle className="text-base">
					<Skeleton className="h-4 w-20" />
				</ItemTitle>
				<ItemDescription>
					<span className="inline-block animate-pulse rounded-md bg-muted h-3.5 w-3/4" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-3 w-14" />
			</ItemActions>
		</Item>
	);
}

export function SourceListSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			{["a", "b", "c", "d", "e"].map((k) => (
				<SkeletonRow key={k} />
			))}
		</div>
	);
}
