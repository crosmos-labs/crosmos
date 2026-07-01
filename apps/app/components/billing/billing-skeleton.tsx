"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { SpacesMeterSkeleton } from "@/components/billing/spaces-meter";
import { UsageMeterSkeleton } from "@/components/billing/usage-meter";

export function BillingSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<Item variant="outline" className="px-4 py-3.5">
				<ItemContent>
					<ItemTitle className="flex h-6 items-center gap-2 text-base">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-5 w-12 rounded-full" />
					</ItemTitle>
					<ItemDescription as="div" className="flex h-5 items-center">
						<Skeleton className="h-3.5 w-4/5" />
					</ItemDescription>
				</ItemContent>
			</Item>
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
					<Skeleton className="h-3 w-56" />
				</div>
			</div>
			<span className="sr-only">Loading billing data…</span>
		</div>
	);
}
