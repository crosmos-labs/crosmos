"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crosmos/ui/components/item";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@crosmos/ui/components/pagination";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import { IconDotsVertical, IconFileText, IconTrash } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { deleteSource } from "@/actions/sources";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteSourceDialog } from "@/components/sources/delete-source-dialog";
import { SourceDetailSheet } from "@/components/sources/source-detail-sheet";
import { SourceStatus } from "@/components/sources/source-status";
import type { SourcesResponse } from "@/hooks/use-sources";
import { formatNumber } from "@/lib/format";
import { listIn, optimisticRemove } from "@/lib/optimistic";
import {
	CONTENT_TYPE_ICONS,
	CONTENT_TYPE_LABELS,
	sourceErrorMessage,
	sourceTitle,
} from "@/lib/source-labels";
import type { SourceSummary } from "@/lib/types/source";

const EMPTY_SOURCES: SourcesResponse = {
	sources: [],
	hasMore: false,
	total: 0,
};
const sourcesList = listIn<SourcesResponse, SourceSummary>(
	(cache) => cache?.sources ?? [],
	(cache, sources) => ({ ...(cache ?? EMPTY_SOURCES), sources }),
);

interface SourceListProps {
	sources: SourceSummary[];
	page: number;
	hasMore: boolean;
	hasFilters: boolean;
	swrKey: string;
	spaceNameLookup: Map<string, string>;
	onPageChange: (page: number) => void;
	onClearFilters: () => void;
}

function SkeletonRow() {
	return (
		<Item variant="outline" className="px-4 py-3.5">
			<ItemMedia variant="icon">
				<Skeleton className="size-4 rounded" />
			</ItemMedia>
			<ItemContent className="gap-1">
				<Skeleton className="h-5 w-48" />
				<Skeleton className="h-4 w-72" />
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-3.5 w-28" />
			</ItemActions>
		</Item>
	);
}

export function SourceListSkeleton() {
	return (
		<ItemGroup>
			{["a", "b", "c", "d", "e"].map((k) => (
				<SkeletonRow key={k} />
			))}
		</ItemGroup>
	);
}

export function SourceList({
	sources,
	page,
	hasMore,
	hasFilters,
	swrKey,
	spaceNameLookup,
	onPageChange,
	onClearFilters,
}: SourceListProps) {
	const [deleteTarget, setDeleteTarget] = useState<SourceSummary | null>(null);
	const [detailTarget, setDetailTarget] = useState<SourceSummary | null>(null);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const handleDelete = useCallback(
		(sourceUuid: string, spaceUuid: string) => {
			setDetailTarget(null);
			runAction(
				() =>
					optimisticRemove<SourceSummary, SourcesResponse>(
						mutate,
						swrKey,
						(s) => s.id === sourceUuid,
						() => deleteSource(sourceUuid, spaceUuid),
						{ adapter: sourcesList },
					),
				{
					toast: {
						success: "Source deleted",
						error: "Failed to delete source",
					},
				},
			);
		},
		[runAction, mutate, swrKey],
	);

	if (sources.length === 0 && page === 1) {
		if (hasFilters) {
			return (
				<EmptyState
					icon={IconFileText}
					title="No matching sources"
					description="No sources match the current filters. Try adjusting your selection."
				>
					<Button variant="outline" size="sm" onClick={onClearFilters}>
						Clear filters
					</Button>
				</EmptyState>
			);
		}
		return (
			<EmptyState
				icon={IconFileText}
				title="No sources yet"
				description="Sources will appear here once data is ingested into your spaces."
			/>
		);
	}

	const hasPrev = page > 1;

	return (
		<div className="flex flex-col gap-4">
			<ItemGroup>
				{sources.map((source) => {
					const ContentTypeIcon = CONTENT_TYPE_ICONS[source.content_type];
					const title = sourceTitle(source);
					const spaceName = spaceNameLookup.get(source.space_id);
					const errorMessage =
						source.extraction_status === "failed"
							? sourceErrorMessage(source.meta)
							: null;

					return (
						<Item
							key={source.id}
							variant="outline"
							className="relative px-4 py-3.5"
						>
							<button
								type="button"
								aria-label={`View source: ${title}`}
								onClick={() => setDetailTarget(source)}
								className="absolute inset-0 cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
							/>
							<ItemMedia variant="icon">
								<ContentTypeIcon className="size-4 text-muted-foreground" />
							</ItemMedia>
							<ItemContent className="gap-0.5">
								<ItemTitle className="text-base">{title}</ItemTitle>
								<ItemDescription as="div" className="line-clamp-1">
									{CONTENT_TYPE_LABELS[source.content_type]}
									<span aria-hidden> · </span>
									{spaceName && (
										<>
											<span>
												<Link
													href={`/spaces/${source.space_id}`}
													className="relative z-10 underline-offset-4 transition-colors hover:text-foreground hover:underline"
												>
													{spaceName}
												</Link>
											</span>
											<span aria-hidden> · </span>
										</>
									)}
									{formatNumber(source.token_count)} tokens
								</ItemDescription>
								{errorMessage && (
									<p className="line-clamp-1 text-sm text-destructive">
										{errorMessage}
									</p>
								)}
							</ItemContent>
							<ItemActions className="gap-3">
								<SourceStatus
									status={source.extraction_status}
									className="text-sm"
								/>
								<span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
									{formatDistanceToNow(new Date(source.created_at), {
										addSuffix: true,
									})}
								</span>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Open source actions"
											className="relative z-10 text-muted-foreground/80 hover:text-foreground focus:ring-0 focus-visible:ring-0"
										>
											<IconDotsVertical />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
										<DropdownMenuGroup>
											<DropdownMenuItem
												variant="destructive"
												onClick={() => setDeleteTarget(source)}
												disabled={activeCount > 0}
											>
												<IconTrash />
												Delete
											</DropdownMenuItem>
										</DropdownMenuGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</ItemActions>
						</Item>
					);
				})}
			</ItemGroup>
			{(hasPrev || hasMore) && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (hasPrev) onPageChange(page - 1);
								}}
								className={cn(!hasPrev && "pointer-events-none opacity-50")}
							/>
						</PaginationItem>
						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (hasMore) onPageChange(page + 1);
								}}
								className={cn(!hasMore && "pointer-events-none opacity-50")}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
			<SourceDetailSheet
				source={detailTarget}
				spaceName={
					detailTarget
						? (spaceNameLookup.get(detailTarget.space_id) ?? null)
						: null
				}
				onOpenChange={(open) => {
					if (!open) setDetailTarget(null);
				}}
				onRequestDelete={() => {
					if (detailTarget) setDeleteTarget(detailTarget);
				}}
			/>
			<DeleteSourceDialog
				source={deleteTarget}
				onDelete={handleDelete}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</div>
	);
}
