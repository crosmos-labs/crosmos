"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crosmos/ui/components/table";
import { IconEyeOff } from "@tabler/icons-react";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { EmptyState } from "@/components/empty-state";
import { VisibilitySettings } from "@/components/settings/visibility/visibility-settings";
import { useCurrentUser } from "@/hooks/use-current-user";
import { orgKey, useOrg } from "@/hooks/use-org";

const GROUP_COLUMNS = ["Name", "Slug", "Members"];

function VisibilityTableSkeletonRow() {
	return (
		<TableRow className="hover:bg-transparent">
			<TableCell>
				<Skeleton className="h-4 w-32" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-28" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-16" />
			</TableCell>
			<TableCell className="w-10" />
		</TableRow>
	);
}

function VisibilityPageSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-8">
			<Item variant="outline" className="px-4 py-3.5">
				<ItemContent>
					<ItemTitle className="text-base">
						<Skeleton className="h-4 w-40" />
					</ItemTitle>
					<ItemDescription as="div">
						<Skeleton className="h-3.5 w-3/4" />
					</ItemDescription>
				</ItemContent>
				<ItemActions>
					<Skeleton className="h-6 w-11 rounded-full" />
				</ItemActions>
			</Item>

			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-24" />
						<Skeleton className="h-8 w-32" />
					</div>
					<Skeleton className="h-8 w-24" />
				</div>

				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							{GROUP_COLUMNS.map((column) => (
								<TableHead
									key={column}
									className="font-normal text-muted-foreground"
								>
									{column}
								</TableHead>
							))}
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{["a", "b", "c"].map((key) => (
							<VisibilityTableSkeletonRow key={key} />
						))}
					</TableBody>
				</Table>
			</div>
			<span className="sr-only">Loading visibility…</span>
		</div>
	);
}

export default function VisibilityPage() {
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const { data: org, error, isLoading } = useOrg(orgId);
	const { mutate } = useSWRConfig();

	const canManageVisibility =
		org?.your_role === "owner" || org?.your_role === "admin";

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Visibility</h1>
				<p className="text-sm text-muted-foreground">
					Manage visibility groups and access rules for private memories.
				</p>
			</div>

			{error ? (
				<DataFetchError
					message={error.message}
					onRetry={() => (orgId ? mutate(orgKey(orgId)) : Promise.resolve())}
				/>
			) : isLoading || !org ? (
				<VisibilityPageSkeleton />
			) : canManageVisibility ? (
				<VisibilitySettings />
			) : (
				<EmptyState
					icon={IconEyeOff}
					title="Visibility is restricted"
					description="Only organization owners and admins can manage visibility rules."
				>
					<Button variant="outline" asChild>
						<Link href="/settings">Go to Settings</Link>
					</Button>
				</EmptyState>
			)}
		</div>
	);
}
