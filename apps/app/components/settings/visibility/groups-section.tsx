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
import { Button } from "@crosmos/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import { Input } from "@crosmos/ui/components/input";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crosmos/ui/components/table";
import { cn } from "@crosmos/ui/lib/utils";
import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { deleteGroup, updateGroup } from "@/actions/visibility";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import {
	useGroups,
	visibilityGrantsKey,
	visibilityGroupsKey,
} from "@/hooks/use-visibility";
import { optimisticRemove } from "@/lib/optimistic";
import type { VisibilityGroup } from "@/lib/types/visibility";
import { CreateGroupDialog } from "./create-group-dialog";
import { GroupMembersSheet } from "./group-members-sheet";

function isOptimisticGroup(group: VisibilityGroup) {
	return group.id.startsWith("optimistic-");
}

export function GroupsSection({
	orgId,
	disabled = false,
}: {
	orgId: string;
	disabled?: boolean;
}) {
	const { data: groups, isLoading } = useGroups(orgId);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();

	const [createOpen, setCreateOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<VisibilityGroup | null>(
		null,
	);
	const [membersTarget, setMembersTarget] = useState<VisibilityGroup | null>(
		null,
	);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draft, setDraft] = useState("");

	const groupsKey = visibilityGroupsKey(orgId);

	function startRename(group: VisibilityGroup) {
		if (disabled) return;
		setEditingId(group.id);
		setDraft(group.name);
	}

	async function commitRename(group: VisibilityGroup) {
		if (disabled) return;
		const next = draft.trim();
		setEditingId(null);
		if (next === "" || next === group.name) return;
		await mutate(
			groupsKey,
			(cur?: VisibilityGroup[]) =>
				(cur ?? []).map((g) => (g.id === group.id ? { ...g, name: next } : g)),
			{ revalidate: false },
		);
		const result = await updateGroup(orgId, group.id, { name: next });
		if (!result.ok) {
			await mutate(groupsKey);
			toast.error(result.message || "Couldn't rename group");
			return;
		}
		await mutate(groupsKey);
	}

	function handleDelete(group: VisibilityGroup) {
		if (disabled) return;
		runAction(
			() =>
				optimisticRemove<VisibilityGroup>(
					mutate,
					groupsKey,
					(g) => g.id === group.id,
					() => deleteGroup(orgId, group.id),
					// Grants referencing the group are removed server-side.
				).then(() => mutate(visibilityGrantsKey(orgId))),
			{ toast: { success: "Group deleted", error: "Couldn't delete group" } },
		);
	}

	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold">Groups</h2>
				<Button
					size="sm"
					onClick={() => setCreateOpen(true)}
					disabled={disabled}
				>
					<IconPlus className="size-4" />
					New group
				</Button>
			</div>

			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="font-normal text-muted-foreground">
							Name
						</TableHead>
						<TableHead className="font-normal text-muted-foreground">
							Slug
						</TableHead>
						<TableHead className="font-normal text-muted-foreground">
							Members
						</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading && !groups ? (
						["a", "b", "c"].map((k) => (
							<TableRow key={k}>
								<TableCell>
									<Skeleton className="h-8 w-36" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-28" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-12" />
								</TableCell>
								<TableCell className="w-10">
									<Skeleton className="size-8" />
								</TableCell>
							</TableRow>
						))
					) : !groups || groups.length === 0 ? (
						<TableRow className="hover:bg-transparent">
							<TableCell
								colSpan={4}
								className="h-24 text-center text-muted-foreground"
							>
								No groups yet. Create a group to bucket users.
							</TableCell>
						</TableRow>
					) : (
						groups.map((group) => {
							const isOptimistic = isOptimisticGroup(group);
							return (
								<TableRow
									key={group.id}
									className={cn(
										"hover:transition-none",
										isOptimistic && "opacity-50",
									)}
								>
									<TableCell className="font-medium">
										{isOptimistic ? (
											group.name
										) : editingId === group.id ? (
											<Input
												autoFocus
												value={draft}
												onChange={(e) => setDraft(e.target.value)}
												onBlur={() => commitRename(group)}
												onKeyDown={(e) => {
													if (e.key === "Enter") commitRename(group);
													if (e.key === "Escape") setEditingId(null);
												}}
												className="h-8 focus-visible:border-input focus-visible:ring-0"
											/>
										) : (
											<button
												type="button"
												className="rounded px-1 py-0.5 text-left hover:bg-muted"
												onClick={() => startRename(group)}
											>
												{group.name}
											</button>
										)}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{group.slug}
									</TableCell>
									<TableCell>{group.member_count}</TableCell>
									<TableCell className="w-10">
										{!isOptimistic && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label={`Actions for ${group.name}`}
														disabled={disabled}
													>
														<IconDotsVertical />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														disabled={disabled}
														onClick={() => setMembersTarget(group)}
													>
														Manage members
													</DropdownMenuItem>
													<DropdownMenuItem
														variant="destructive"
														disabled={disabled}
														onClick={() => setDeleteTarget(group)}
													>
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>

			<CreateGroupDialog
				orgId={orgId}
				open={createOpen}
				onOpenChange={setCreateOpen}
				disabled={disabled}
			/>

			<GroupMembersSheet
				orgId={orgId}
				group={membersTarget}
				disabled={disabled}
				onOpenChange={(open) => {
					if (!open) setMembersTarget(null);
				}}
			/>

			<AlertDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete group?</AlertDialogTitle>
						<AlertDialogDescription>
							Deleting <strong>{deleteTarget?.name}</strong> also removes its
							memberships and any access rules that reference it. This can't be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={disabled}
							onClick={() => {
								if (deleteTarget) handleDelete(deleteTarget);
								setDeleteTarget(null);
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}
