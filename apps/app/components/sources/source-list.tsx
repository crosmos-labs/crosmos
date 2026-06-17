"use client";

import { Badge } from "@crosmos/ui/components/badge";
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
import {
	IconBraces,
	IconCode,
	IconDotsVertical,
	IconFileText,
	IconFileTypePdf,
	IconHeadphones,
	IconLink,
	IconMarkdown,
	IconMessageCircle,
	IconPhoto,
	IconTrash,
	IconVideo,
} from "@tabler/icons-react";
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
import type { SourcesResponse } from "@/hooks/use-sources";
import { listIn, optimisticRemove } from "@/lib/optimistic";
import type {
	ContentTypeStr,
	ExtractionStatus,
	SourceSummary,
} from "@/lib/types/source";

const EMPTY_SOURCES: SourcesResponse = {
	sources: [],
	hasMore: false,
	total: 0,
};
const sourcesList = listIn<SourcesResponse, SourceSummary>(
	(cache) => cache?.sources ?? [],
	(cache, sources) => ({ ...(cache ?? EMPTY_SOURCES), sources }),
);

const CONTENT_TYPE_ICONS: Record<ContentTypeStr, typeof IconFileText> = {
	text: IconFileText,
	markdown: IconMarkdown,
	conversation: IconMessageCircle,
	pdf: IconFileTypePdf,
	image: IconPhoto,
	audio: IconHeadphones,
	video: IconVideo,
	html: IconCode,
	json: IconBraces,
};

export const EXTRACTION_STATUS_LABELS: Record<ExtractionStatus, string> = {
	pending: "Extraction pending",
	processing: "Extracting",
	completed: "Extracted",
	failed: "Extraction failed",
};

export const EXTRACTION_STATUS_BADGE_VARIANT: Record<
	ExtractionStatus,
	"secondary" | "outline" | "destructive" | "default"
> = {
	pending: "outline",
	processing: "default",
	completed: "secondary",
	failed: "destructive",
};

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
			<ItemContent>
				<ItemTitle className="h-5 text-base">
					<Skeleton className="h-4 w-20" />
				</ItemTitle>
				<ItemDescription as="div" className="flex h-5 items-center">
					<Skeleton className="h-3.5 w-3/4" />
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
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const handleDelete = useCallback(
		(sourceUuid: string, spaceUuid: string) => {
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

	const toggleExpand = useCallback((id: string) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

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
					const isExpanded = expandedIds.has(source.id);
					const ContentTypeIcon = CONTENT_TYPE_ICONS[source.content_type];

					return (
						<Item
							key={source.id}
							variant="outline"
							className="hover:bg-muted/50 transition-colors hover:transition-none px-4 py-3.5"
						>
							<ItemContent>
								<ItemTitle className="flex items-center gap-2 text-base">
									<ContentTypeIcon className="size-4 text-muted-foreground" />
									<Badge
										variant={
											EXTRACTION_STATUS_BADGE_VARIANT[source.extraction_status]
										}
									>
										{EXTRACTION_STATUS_LABELS[source.extraction_status]}
									</Badge>
									{spaceNameLookup.get(source.space_id) && (
										<Link
											href={`/spaces/${source.space_id}`}
											className="text-muted-foreground hover:text-foreground transition-colors"
											aria-label={`View space: ${spaceNameLookup.get(source.space_id) ?? ""}`}
										>
											<Badge variant="outline" className="text-xs font-normal">
												{spaceNameLookup.get(source.space_id) ?? ""}
											</Badge>
										</Link>
									)}
									{!spaceNameLookup.get(source.space_id) && (
										<Link
											href={`/spaces/${source.space_id}`}
											className="text-muted-foreground hover:text-foreground transition-colors"
											aria-label="View space"
										>
											<IconLink className="size-3.5" />
										</Link>
									)}
								</ItemTitle>
								<ItemDescription>
									<button
										type="button"
										onClick={() => toggleExpand(source.id)}
										className={cn(
											"text-left cursor-pointer",
											!isExpanded && "line-clamp-1",
										)}
									>
										<span className="whitespace-pre-wrap">
											{source.content_preview}
										</span>
									</button>
								</ItemDescription>
								{isExpanded &&
									source.meta &&
									Object.keys(source.meta).length > 0 && (
										<div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
											{Object.entries(source.meta).map(([key, value]) => (
												<span
													key={key}
													className="rounded bg-muted px-1.5 py-0.5"
												>
													{key}: {String(value)}
												</span>
											))}
										</div>
									)}
							</ItemContent>
							<ItemActions>
								<span className="text-sm text-muted-foreground whitespace-nowrap">
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
											className="focus:ring-0 focus-visible:ring-0"
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
