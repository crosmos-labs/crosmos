"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crosmos/ui/components/alert-dialog";
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
import { Kbd } from "@crosmos/ui/components/kbd";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@crosmos/ui/components/pagination";
import { cn } from "@crosmos/ui/lib/utils";
import {
	IconBraces,
	IconCode,
	IconCornerDownLeft,
	IconDotsVertical,
	IconFileText,
	IconFileTypePdf,
	IconHeadphones,
	IconLink,
	IconMarkdown,
	IconPhoto,
	IconTrash,
	IconVideo,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { deleteSource } from "@/actions/sources";
import { EmptyState } from "@/components/empty-state";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import type { SourcesResponse } from "@/hooks/use-sources";
import { SOURCES_PER_PAGE } from "@/lib/params/constants";
import type {
	ContentTypeStr,
	ExtractionStatus,
	SourceSummary,
} from "@/lib/types/source";

const CONTENT_TYPE_ICONS: Record<ContentTypeStr, typeof IconFileText> = {
	text: IconFileText,
	markdown: IconMarkdown,
	pdf: IconFileTypePdf,
	image: IconPhoto,
	audio: IconHeadphones,
	video: IconVideo,
	html: IconCode,
	json: IconBraces,
};

const CONTENT_TYPE_LABELS: Record<ContentTypeStr, string> = {
	text: "Text",
	markdown: "Markdown",
	pdf: "PDF",
	image: "Image",
	audio: "Audio",
	video: "Video",
	html: "HTML",
	json: "JSON",
};

const EXTRACTION_STATUS_LABELS: Record<ExtractionStatus, string> = {
	pending: "Extraction pending",
	processing: "Extracting",
	completed: "Extracted",
	failed: "Extraction failed",
};

const EXTRACTION_STATUS_BADGE_VARIANT: Record<
	ExtractionStatus,
	"secondary" | "outline" | "destructive" | "default"
> = {
	pending: "outline",
	processing: "default",
	completed: "secondary",
	failed: "destructive",
};

function DeleteSourceDialog({
	source,
	onDelete,
	onOpenChange,
}: {
	source: SourceSummary | null;
	onDelete: (sourceUuid: string, spaceUuid: string) => void;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<AlertDialog open={!!source} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Source</AlertDialogTitle>
					<AlertDialogDescription>
						This source and all its associated data will be permanently deleted.
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{source && (
					<div className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 p-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Type</span>
							<Badge variant="outline">
								{CONTENT_TYPE_LABELS[source.content_type]}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Status</span>
							<Badge
								variant={
									EXTRACTION_STATUS_BADGE_VARIANT[source.extraction_status]
								}
							>
								{EXTRACTION_STATUS_LABELS[source.extraction_status]}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Tokens</span>
							<span className="text-foreground">
								{source.token_count.toLocaleString()}
							</span>
						</div>
						<div className="mt-1 line-clamp-3 text-muted-foreground whitespace-pre-wrap">
							{source.content_preview}
						</div>
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">
						Cancel <Kbd>Esc</Kbd>
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							if (source) {
								onDelete(source.id, source.space_id);
								onOpenChange(false);
							}
						}}
					>
						Delete{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

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
			const offset = (page - 1) * SOURCES_PER_PAGE;

			const recompute = (current: SourcesResponse): SourcesResponse => {
				const sources = current.sources.filter((s) => s.id !== sourceUuid);
				const total = current.total - 1;
				return {
					sources,
					total,
					hasMore: offset + sources.length < total,
				};
			};

			runAction(
				async () => {
					await mutate(
						swrKey,
						async (current: SourcesResponse | undefined) => {
							await deleteSource(sourceUuid, spaceUuid);
							return current
								? recompute(current)
								: { sources: [], hasMore: false, total: 0 };
						},
						{
							optimisticData: (current: SourcesResponse | undefined) =>
								current
									? recompute(current)
									: { sources: [], hasMore: false, total: 0 },
							rollbackOnError: true,
							revalidate: false,
						},
					);
				},
				{
					toast: {
						success: "Source deleted",
						error: "Failed to delete source",
					},
				},
			);
		},
		[runAction, mutate, swrKey, page],
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
