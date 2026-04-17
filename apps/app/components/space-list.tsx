"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crosmos/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crosmos/ui/components/empty";
import { Input } from "@crosmos/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { IconBox, IconDotsVertical, IconPlus } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { type Space, createSpace, deleteSpace } from "@/actions/spaces";
import { useActionLoader } from "@/components/providers/action-loader-provider";

function CreateSpaceDialog({
	open,
	onOpenChange,
	onCreateSpace,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateSpace: (name: string, description?: string) => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	function handleClose() {
		setName("");
		setDescription("");
		onOpenChange(false);
	}

	function handleCreate() {
		if (!name.trim()) return;
		const spaceName = name.trim();
		const spaceDescription = description.trim() || undefined;
		setName("");
		setDescription("");
		onOpenChange(false);
		onCreateSpace(spaceName, spaceDescription);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Space</DialogTitle>
					<DialogDescription>
						Enter a name and optional description for your new memory space.
					</DialogDescription>
				</DialogHeader>
				<Input
					placeholder="e.g. Startup, School"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleCreate();
					}}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
				<textarea
					placeholder="Description (optional)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={2}
					className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-input focus-visible:ring-0 resize-none"
				/>
				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleCreate} size="lg" disabled={!name.trim()}>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function SpaceList({ spaces }: { spaces: Space[] }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Space | null>(null);
	const router = useRouter();
	const { runAction } = useActionLoader();

	const handleCreateSpace = useCallback(
		(name: string) => {
			runAction(() => createSpace(name), {
				toast: {
					success: "Space created",
					error: "Failed to create space",
				},
			})
				.then(() => router.refresh())
				.catch(() => {});
		},
		[runAction, router],
	);

	const handleDeleteSpace = useCallback(
		(spaceId: number) => {
			runAction(() => deleteSpace(spaceId), {
				toast: {
					success: "Space deleted",
					error: "Failed to delete space",
				},
			})
				.then(() => router.refresh())
				.catch(() => {});
		},
		[runAction, router],
	);

	function SpaceCountRow({
		count,
		onCreateClick,
	}: {
		count: number;
		onCreateClick: () => void;
	}) {
		return (
			<div className="flex items-center justify-between">
				<span className="text-sm text-muted-foreground">
					{count} space{count !== 1 ? "s" : ""}
				</span>
				<Button onClick={onCreateClick}>
					<IconPlus data-icon="inline-start" />
					Create
				</Button>
			</div>
		);
	}

	if (spaces.length === 0) {
		return (
			<>
				<SpaceCountRow
					count={spaces.length}
					onCreateClick={() => setDialogOpen(true)}
				/>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<IconBox />
						</EmptyMedia>
						<EmptyTitle>No spaces yet</EmptyTitle>
						<EmptyDescription>
							Create a memory space to start storing and retrieving memories.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
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
			/>
			<ItemGroup>
				{spaces.map((space) => (
					<Item
						key={space.id}
						variant="outline"
						className="hover:bg-muted/50 transition-colors hover:transition-none px-4 py-3.5"
					>
						<ItemContent>
							<ItemTitle className="text-base">{space.name}</ItemTitle>
							<ItemDescription>
								{space.description ?? "No description"}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								{formatDistanceToNow(new Date(space.created_at), {
									addSuffix: true,
								})}
							</span>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon-sm"
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
										>
											Delete
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</ItemActions>
					</Item>
				))}
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

function DeleteSpaceDialog({
	space,
	onDelete,
	onOpenChange,
}: {
	space: Space | null;
	onDelete: (spaceId: number) => void;
	onOpenChange: (open: boolean) => void;
}) {
	const [confirmName, setConfirmName] = useState("");
	const canDelete = space !== null && confirmName === space.name;

	function handleClose() {
		setConfirmName("");
		onOpenChange(false);
	}

	function handleDelete() {
		if (!space || !canDelete) return;
		setConfirmName("");
		onOpenChange(false);
		onDelete(space.id);
	}

	return (
		<Dialog open={!!space} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Space</DialogTitle>
					<DialogDescription asChild>
						<div className="flex flex-col gap-3 text-left">
							<span>
								This will permanently delete this space and all its{" "}
								<strong>memories</strong>,<strong>entities</strong>, and{" "}
								<strong>sources</strong>. This action cannot be undone.
							</span>
							<div className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 p-3 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Name</span>
									<span className="font-medium text-foreground">
										{space?.name}
									</span>
								</div>
								{space?.description && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Description</span>
										<span className="text-foreground">{space.description}</span>
									</div>
								)}
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Created</span>
									<span className="text-foreground">
										{space
											? formatDistanceToNow(new Date(space.created_at), {
													addSuffix: true,
												})
											: ""}
									</span>
								</div>
							</div>
							<span>
								Type <strong>{space?.name}</strong> to confirm.
							</span>
						</div>
					</DialogDescription>
				</DialogHeader>
				<Input
					placeholder={space?.name}
					value={confirmName}
					onChange={(e) => setConfirmName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleDelete();
					}}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={!canDelete}
					>
						Delete Space
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
