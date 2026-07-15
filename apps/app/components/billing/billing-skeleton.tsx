"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
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
			<section className="flex flex-col gap-3">
				<Skeleton className="h-6 w-36" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-16 w-full rounded-lg" />
					<Skeleton className="h-16 w-full rounded-lg" />
					<Skeleton className="h-16 w-full rounded-lg" />
				</div>
			</section>
			<span className="sr-only">Loading billing data…</span>
		</div>
	);
}

export function UsageSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<UsageMeterSkeleton />
				<UsageMeterSkeleton />
			</div>
			<span className="sr-only">Loading usage data…</span>
		</div>
	);
}
