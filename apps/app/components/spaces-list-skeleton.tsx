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
					<Skeleton className="h-4 w-24" />
				</ItemTitle>
				<ItemDescription as="div">
					<Skeleton className="h-3.5 w-2/3" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-3 w-20" />
			</ItemActions>
		</Item>
	);
}

export function SpacesListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-8 w-20" />
			</div>
			{["a", "b", "c", "d", "e"].map((k) => (
				<SkeletonRow key={k} />
			))}
			<span className="sr-only">Loading spaces…</span>
		</div>
	);
}
