"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
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
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { useHotkey } from "@crosmos/ui/hooks/use-hotkey";
import { cn } from "@crosmos/ui/lib/utils";
import { IconBox, IconDotsVertical } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { createSpace, deleteSpace } from "@/actions/spaces";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { HotkeyKbd } from "@/components/shared/hotkey-kbd";
import { CreateSpaceDialog } from "@/components/spaces/create-space-dialog";
import { DeleteSpaceDialog } from "@/components/spaces/delete-space-dialog";
import { useUsage } from "@/hooks/use-usage";
import { optimisticInsert, optimisticRemove } from "@/lib/optimistic";
import type { Space } from "@/lib/types/space";
import { unwrapAction } from "@/lib/unwrap-action";

function SpaceCountRow({
	count,
	onCreateClick,
	disabled,
}: {
	count: number;
	onCreateClick: () => void;
	disabled?: boolean;
}) {
	const { data: usage } = useUsage();
	const limit = usage?.spaces.limit;

	return (
		<div className="flex items-center justify-between">
			<span className="text-sm text-muted-foreground">
				{limit !== undefined && limit !== -1
					? `${count} of ${limit} spaces`
					: `${count} space${count !== 1 ? "s" : ""}`}
			</span>
			<Button onClick={onCreateClick} disabled={disabled}>
				Create
				<HotkeyKbd />
			</Button>
		</div>
	);
}

function SkeletonRow() {
	return (
		<Item variant="outline" className="px-4 py-3.5">
			<ItemContent>
				<ItemTitle className="h-6 text-base">
					<Skeleton className="h-4 w-24" />
				</ItemTitle>
				<ItemDescription as="div" className="flex h-5 items-center">
					<Skeleton className="h-3.5 w-2/3" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-3 w-20" />
			</ItemActions>
		</Item>
	);
}

export function SpacesListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-8 w-20" />
			</div>
			<ItemGroup>
				{["a", "b", "c", "d", "e"].map((k) => (
					<SkeletonRow key={k} />
				))}
			</ItemGroup>
			<span className="sr-only">Loading spaces…</span>
		</div>
	);
}

export function SpaceList({
	spaces,
	orgId,
	swrKey,
}: {
	spaces: Space[];
	orgId: string;
	swrKey: string;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Space | null>(null);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	useHotkey("k", () => {
		if (activeCount > 0) return;
		setDialogOpen(true);
	});

	const handleCreateSpace = useCallback(
		(name: string, description?: string) => {
			const now = new Date().toISOString();
			const tempSpace: Space = {
				id: `optimistic-${Date.now()}`,
				org_id: orgId,
				name,
				description: description || null,
				meta: null,
				created_at: now,
				updated_at: now,
			};
			runAction(
				() =>
					optimisticInsert(mutate, swrKey, tempSpace, async () =>
						unwrapAction(await createSpace(name, description)),
					),
				{ toast: { success: "Space created" } },
			).catch((err: unknown) => {
				const code =
					err && typeof err === "object" && "code" in err
						? (err as { code: unknown }).code
						: null;
				if (code === "quota_exceeded") {
					toast.error(
						err instanceof Error && err.message
							? err.message
							: "You've reached your plan's memory space limit.",
					);
				} else {
					toast.error("Failed to create space");
				}
			});
		},
		[runAction, mutate, orgId, swrKey],
	);

	const handleDeleteSpace = useCallback(
		(spaceId: string) => {
			runAction(
				() =>
					optimisticRemove<Space>(
						mutate,
						swrKey,
						(s) => s.id === spaceId,
						() => deleteSpace(spaceId),
					),
				{
					toast: {
						success: "Space deleted",
						error: "Failed to delete space",
					},
				},
			);
		},
		[runAction, mutate, swrKey],
	);

	if (spaces.length === 0) {
		return (
			<>
				<SpaceCountRow
					count={spaces.length}
					onCreateClick={() => setDialogOpen(true)}
					disabled={activeCount > 0}
				/>
				<EmptyState
					icon={IconBox}
					title="No spaces yet"
					description="Create a memory space to start storing and retrieving memories."
				/>
				<CreateSpaceDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					onCreateSpace={handleCreateSpace}
				/>
				<DeleteSpaceDialog
					space={deleteTarget}
					onDelete={handleDeleteSpace}
					onOpenChange={(open) => {
						if (!open) setDeleteTarget(null);
					}}
				/>
			</>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<SpaceCountRow
				count={spaces.length}
				onCreateClick={() => setDialogOpen(true)}
				disabled={activeCount > 0}
			/>
			<ItemGroup>
				{spaces.map((space) => {
					// Optimistic placeholders carry an "optimistic-" id prefix (see handleCreateSpace).
					const isOptimistic = space.id.startsWith("optimistic-");
					return (
						<Item
							key={space.id}
							variant="outline"
							size="lg"
							className={cn(isOptimistic && "opacity-50")}
						>
							<ItemContent>
								<Link href={`/spaces/${space.id}`}>
									<ItemTitle className="text-base">{space.name}</ItemTitle>
									<ItemDescription>
										{space.description ?? "No description"}
									</ItemDescription>
								</Link>
							</ItemContent>
							<ItemActions>
								<span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
									{isOptimistic ? (
										<AnimatedSpinner name="braille" size="1.1em" speed={0.8} />
									) : (
										formatDistanceToNow(new Date(space.created_at), {
											addSuffix: true,
										})
									)}
								</span>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label="Open space actions"
											className="focus:ring-0 focus-visible:ring-0"
										>
											<IconDotsVertical />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start">
										<DropdownMenuGroup>
											<DropdownMenuItem
												variant="destructive"
												onClick={() => setDeleteTarget(space)}
												disabled={activeCount > 0}
											>
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
			<CreateSpaceDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onCreateSpace={handleCreateSpace}
			/>
			<DeleteSpaceDialog
				space={deleteTarget}
				onDelete={handleDeleteSpace}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			/>
		</div>
	);
}
