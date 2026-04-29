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
import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
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
import { cn } from "@crosmos/ui/lib/utils";
import { IconBrain, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { forgetMemory } from "@/actions/memories";
import { EmptyState } from "@/components/empty-state";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import type { Memory, MemoryType } from "@/lib/types/memory";

const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
	viewpoint: "Viewpoint",
	semantic: "Semantic",
	episode: "Episode",
};

const MEMORY_TYPE_BADGE_VARIANT: Record<
	MemoryType,
	"secondary" | "outline" | "ghost"
> = {
	viewpoint: "secondary",
	semantic: "outline",
	episode: "ghost",
};

function ForgetMemoryDialog({
	memory,
	onForget,
	onOpenChange,
}: {
	memory: Memory | null;
	onForget: (memoryUuid: string) => void;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<AlertDialog open={!!memory} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Forget Memory</AlertDialogTitle>
					<AlertDialogDescription>
						This memory will be permanently forgotten. This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{memory && (
					<div className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 p-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Type</span>
							<Badge variant={MEMORY_TYPE_BADGE_VARIANT[memory.memory_type]}>
								{MEMORY_TYPE_LABELS[memory.memory_type]}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Created</span>
							<span className="text-foreground">
								{formatDistanceToNow(new Date(memory.created_at), {
									addSuffix: true,
								})}
							</span>
						</div>
						<div className="mt-1 line-clamp-3 text-muted-foreground whitespace-pre-wrap">
							{memory.content}
						</div>
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							if (memory) {
								onForget(memory.id);
								onOpenChange(false);
							}
						}}
					>
						Forget
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

interface MemoryListProps {
	memories: Memory[];
	spaceUuid: string;
	page: number;
	hasMore: boolean;
	onPageChange: (page: number) => void;
}

export function MemoryList({
	memories,
	spaceUuid,
	page,
	hasMore,
	onPageChange,
}: MemoryListProps) {
	const [forgetTarget, setForgetTarget] = useState<Memory | null>(null);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const swrKey = `/memories?space_uuid=${spaceUuid}&page=${page}`;

	const handleForget = useCallback(
		(memoryUuid: string) => {
			runAction(
				async () => {
					await mutate(
						swrKey,
						async (current: Memory[] | undefined) => {
							await forgetMemory(memoryUuid, spaceUuid);
							return current?.filter((m) => m.id !== memoryUuid) ?? [];
						},
						{
							optimisticData: (current: Memory[] | undefined) =>
								current?.filter((m) => m.id !== memoryUuid) ?? [],
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
					const isOptimistic = memory.id.startsWith("optimistic-");
					const isExpanded = expandedIds.has(memory.id);

					return (
						<Item
							key={memory.id}
							variant="outline"
							className={cn(
								"hover:bg-muted/50 transition-colors hover:transition-none px-4 py-3.5",
								isOptimistic && "opacity-50",
							)}
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
									{isOptimistic ? (
										<AnimatedSpinner
											name="diagswipe"
											size="1.1em"
											speed={0.8}
										/>
									) : (
										formatDistanceToNow(new Date(memory.created_at), {
											addSuffix: true,
										})
									)}
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
