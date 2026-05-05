"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";

function SkeletonRow() {
	return (
		<Item variant="outline" className="px-4 py-3.5 opacity-40">
			<ItemContent>
				<ItemTitle className="text-base">
					<span className="inline-block h-4 w-20 animate-pulse rounded bg-muted font-mono text-xs text-muted-foreground">
						▓▓▓▓▓▓
					</span>
				</ItemTitle>
				<ItemDescription>
					<span className="inline-block h-3.5 w-3/4 animate-pulse rounded bg-muted font-mono text-xs">
						░░░░░░░░░░░░░░░░░░░░░
					</span>
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<span className="inline-block h-3 w-14 animate-pulse rounded bg-muted font-mono text-xs">
					░░░░
				</span>
			</ItemActions>
		</Item>
	);
}

const SKELETON_ROWS = [
	<SkeletonRow key="skeleton-0" />,
	<SkeletonRow key="skeleton-1" />,
	<SkeletonRow key="skeleton-2" />,
	<SkeletonRow key="skeleton-3" />,
	<SkeletonRow key="skeleton-4" />,
];

export function SourceListSkeleton() {
	return <div className="flex flex-col gap-4">{SKELETON_ROWS}</div>;
}
