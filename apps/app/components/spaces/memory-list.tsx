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
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crosmos/ui/components/tooltip";
import { cn } from "@crosmos/ui/lib/utils";
import {
	IconBrain,
	IconDotsVertical,
	IconHistory,
	IconRepeat,
	IconTrash,
} from "@tabler/icons-react";
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { forgetMemory } from "@/actions/memories";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ForgetMemoryDialog } from "@/components/spaces/forget-memory-dialog";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import type { MemoriesResponse } from "@/hooks/use-memories";
import { clearContentCaches } from "@/lib/content-cache";
import { formatDateTime } from "@/lib/format";
import {
	MEMORY_TYPE_BADGE_VARIANT,
	MEMORY_TYPE_DESCRIPTIONS,
	MEMORY_TYPE_ICONS,
	MEMORY_TYPE_LABELS,
} from "@/lib/memory-labels";
import { listIn, optimisticRemove } from "@/lib/optimistic";
import type { Memory } from "@/lib/types/memory";
import { unwrapAction } from "@/lib/unwrap-action";

const EMPTY_MEMORIES: MemoriesResponse = { memories: [], hasMore: false };
const memoriesList = listIn<MemoriesResponse, Memory>(
	(cache) => cache?.memories ?? [],
	(cache, memories) => ({ ...(cache ?? EMPTY_MEMORIES), memories }),
);

interface MemoryListProps {
	memories: Memory[];
	spaceUuid: string;
	page: number;
	hasMore: boolean;
	hasFilters: boolean;
	swrKey: string;
	onPageChange: (page: number) => void;
	onClearFilters: () => void;
}

function SkeletonMemoryRow() {
	return (
		<Item variant="outline" className="px-4 py-3.5">
			<ItemContent>
				<ItemTitle className="h-5 text-base">
					<Skeleton className="h-4 w-16" />
				</ItemTitle>
				<ItemDescription as="div" className="flex flex-col gap-1.5">
					<Skeleton className="h-3.5 w-full" />
					<Skeleton className="h-3.5 w-2/3" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-3 w-20" />
			</ItemActions>
		</Item>
	);
}

export function MemoryListSkeleton() {
	return (
		<ItemGroup aria-busy="true">
			{["a", "b", "c", "d", "e"].map((k) => (
				<SkeletonMemoryRow key={k} />
			))}
			<span className="sr-only">Loading memories…</span>
		</ItemGroup>
	);
}

export function SpaceDetailSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<Skeleton className="h-7 w-40" />
				<Skeleton className="h-4 w-56" />
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<Skeleton className="h-5 w-20" />
					<Skeleton className="h-4 w-80 max-w-full" />
				</div>
				<Skeleton className="h-8 w-64 max-w-full" />
				<MemoryListSkeleton />
			</div>
			<span className="sr-only">Loading space details…</span>
		</div>
	);
}

export function MemoryList({
	memories,
	spaceUuid,
	page,
	hasMore,
	hasFilters,
	swrKey,
	onPageChange,
	onClearFilters,
}: MemoryListProps) {
	const [forgetTarget, setForgetTarget] = useState<Memory | null>(null);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const orgId = useActiveOrgId();
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const handleForget = useCallback(
		(memoryUuid: string) => {
			runAction(
				() =>
					optimisticRemove<Memory, MemoriesResponse>(
						mutate,
						swrKey,
						(m) => m.id === memoryUuid,
						async () => {
							unwrapAction(await forgetMemory(memoryUuid, spaceUuid));
						},
						{ adapter: memoriesList },
					),
				{ toast: { success: "Memory forgotten" } },
			).catch((err: unknown) => {
				if ((err as { status?: number }).status === 404 && orgId) {
					toast.error("This memory is no longer available.");
					// The current page key is already reconciled by optimisticRemove.
					void clearContentCaches(mutate, orgId, swrKey);
					return;
				}
				toast.error("Failed to forget memory");
			});
		},
		[runAction, mutate, swrKey, spaceUuid, orgId],
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

	if (memories.length === 0 && page === 1) {
		if (hasFilters) {
			return (
				<EmptyState
					icon={IconBrain}
					title="No matching memories"
					description="No memories match the current filters. Try adjusting your selection."
				>
					<Button variant="outline" size="sm" onClick={onClearFilters}>
						Clear filters
					</Button>
				</EmptyState>
			);
		}
		return (
			<EmptyState
				icon={IconBrain}
				title="No memories yet"
				description="Memories will appear here once data is ingested into this space."
			/>
		);
	}

	const hasPrev = page > 1;

	return (
		<div className="flex flex-col gap-4">
			<ItemGroup>
				{memories.map((memory) => {
					const isExpanded = expandedIds.has(memory.id);
					const TypeIcon = MEMORY_TYPE_ICONS[memory.memory_type];

					return (
						<Item key={memory.id} variant="outline" className="px-4 py-3.5">
							<ItemContent>
								<ItemTitle className="flex items-center gap-2 text-base">
									<Tooltip>
										<TooltipTrigger asChild>
											<Badge
												tabIndex={0}
												variant={MEMORY_TYPE_BADGE_VARIANT[memory.memory_type]}
											>
												<TypeIcon />
												{MEMORY_TYPE_LABELS[memory.memory_type]}
											</Badge>
										</TooltipTrigger>
										<TooltipContent>
											{MEMORY_TYPE_DESCRIPTIONS[memory.memory_type]}
										</TooltipContent>
									</Tooltip>
									{/* last_accessed_at is non-null from birth, so gate on frequency */}
									{memory.access_frequency > 0 && (
										<>
											<Tooltip>
												<TooltipTrigger asChild>
													<Badge tabIndex={0} variant="outline">
														<IconRepeat />
														Recalled {memory.access_frequency}×
													</Badge>
												</TooltipTrigger>
												<TooltipContent>
													This memory has been retrieved{" "}
													{memory.access_frequency.toLocaleString()} times.
												</TooltipContent>
											</Tooltip>
											<Tooltip>
												<TooltipTrigger asChild>
													<Badge
														tabIndex={0}
														variant="outline"
														aria-label={`Last recalled ${formatDistanceToNowStrict(
															new Date(memory.last_accessed_at),
															{ addSuffix: true },
														)}`}
													>
														<IconHistory />
														{formatDistanceToNowStrict(
															new Date(memory.last_accessed_at),
															{ addSuffix: true },
														)}
													</Badge>
												</TooltipTrigger>
												<TooltipContent>
													Last recalled on{" "}
													{formatDateTime(memory.last_accessed_at)}.
												</TooltipContent>
											</Tooltip>
										</>
									)}
								</ItemTitle>
								<ItemDescription>
									<button
										type="button"
										onClick={() => toggleExpand(memory.id)}
										className={cn(
											"text-left cursor-pointer",
											!isExpanded && "line-clamp-2",
										)}
									>
										<span className="whitespace-pre-wrap">
											{memory.content}
										</span>
									</button>
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
									{formatDistanceToNow(new Date(memory.created_at), {
										addSuffix: true,
									})}
								</span>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Open memory actions"
											className="focus:ring-0 focus-visible:ring-0"
										>
											<IconDotsVertical />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
										<DropdownMenuGroup>
											<DropdownMenuItem
												variant="destructive"
												onClick={() => setForgetTarget(memory)}
												disabled={activeCount > 0}
											>
												<IconTrash />
												Forget
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
			<ForgetMemoryDialog
				memory={forgetTarget}
				onForget={handleForget}
				onOpenChange={(open) => {
					if (!open) setForgetTarget(null);
				}}
			/>
		</div>
	);
}
