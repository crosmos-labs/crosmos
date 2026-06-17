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
import { IconBrain, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { forgetMemory } from "@/actions/memories";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { ForgetMemoryDialog } from "@/components/spaces/forget-memory-dialog";
import type { MemoriesResponse } from "@/hooks/use-memories";
import type { Memory, MemoryType } from "@/lib/types/memory";

export const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
	viewpoint: "Viewpoint",
	semantic: "Semantic",
	episode: "Episode",
	inference: "Inference",
};

export const MEMORY_TYPE_BADGE_VARIANT: Record<
	MemoryType,
	"secondary" | "outline" | "ghost"
> = {
	viewpoint: "secondary",
	semantic: "secondary",
	episode: "secondary",
	inference: "outline",
};

interface MemoryListProps {
	memories: Memory[];
	spaceUuid: string;
	page: number;
	hasMore: boolean;
	swrKey: string;
	onPageChange: (page: number) => void;
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

export function SpaceDetailSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<Skeleton className="h-7 w-40" />
				<Skeleton className="h-4 w-56" />
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-20" />
				</div>
				{["a", "b", "c", "d", "e"].map((k) => (
					<SkeletonMemoryRow key={k} />
				))}
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
	swrKey,
	onPageChange,
}: MemoryListProps) {
	const [forgetTarget, setForgetTarget] = useState<Memory | null>(null);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const handleForget = useCallback(
		(memoryUuid: string) => {
			runAction(
				async () => {
					await mutate(
						swrKey,
						async (current: MemoriesResponse | undefined) => {
							await forgetMemory(memoryUuid, spaceUuid);
							return current
								? {
										...current,
										memories: current.memories.filter(
											(m) => m.id !== memoryUuid,
										),
									}
								: { memories: [], hasMore: false };
						},
						{
							optimisticData: (current: MemoriesResponse | undefined) =>
								current
									? {
											...current,
											memories: current.memories.filter(
												(m) => m.id !== memoryUuid,
											),
										}
									: { memories: [], hasMore: false },
							rollbackOnError: true,
							revalidate: false,
						},
					);
				},
				{
					toast: {
						success: "Memory forgotten",
						error: "Failed to forget memory",
					},
				},
			);
		},
		[runAction, mutate, swrKey, spaceUuid],
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

					return (
						<Item
							key={memory.id}
							variant="outline"
							className="hover:bg-muted/50 transition-colors hover:transition-none px-4 py-3.5"
						>
							<ItemContent>
								<ItemTitle className="flex items-center gap-2 text-base">
									<Badge
										variant={MEMORY_TYPE_BADGE_VARIANT[memory.memory_type]}
									>
										{MEMORY_TYPE_LABELS[memory.memory_type]}
									</Badge>
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
