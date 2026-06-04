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
import { Kbd } from "@crosmos/ui/components/kbd";
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
import {
	IconCornerDownLeft,
	IconDotsVertical,
	IconPlus,
} from "@tabler/icons-react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { deleteGroup } from "@/actions/visibility";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import {
	useGroups,
	visibilityGrantsKey,
	visibilityGroupsKey,
} from "@/hooks/use-visibility";
import { optimisticRemove } from "@/lib/optimistic";
import type { VisibilityGroup } from "@/lib/types/visibility";
import { CreateGroupDialog } from "@/components/settings/visibility/create-group-dialog";
import { GroupMembersSheet } from "@/components/settings/visibility/group-members-sheet";

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
	const { activeCount } = useActionLoaderState();

	const [createOpen, setCreateOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<VisibilityGroup | null>(
		null,
	);
	const [membersTarget, setMembersTarget] = useState<VisibilityGroup | null>(
		null,
	);

	const groupsKey = visibilityGroupsKey(orgId);
	const actionBusy = activeCount > 0;
	const effectiveDisabled = disabled || actionBusy;

	function handleDelete(group: VisibilityGroup) {
		if (effectiveDisabled) return;
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
					disabled={effectiveDisabled}
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
									<TableCell className="font-medium">{group.name}</TableCell>
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
														disabled={effectiveDisabled}
													>
														<IconDotsVertical />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														disabled={effectiveDisabled}
														onClick={() => setMembersTarget(group)}
													>
														Manage members
													</DropdownMenuItem>
													<DropdownMenuItem
														variant="destructive"
														disabled={effectiveDisabled}
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
				disabled={effectiveDisabled}
			/>

			<GroupMembersSheet
				orgId={orgId}
				group={membersTarget}
				disabled={effectiveDisabled}
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
						<AlertDialogCancel variant="ghost">
							Cancel <Kbd>Esc</Kbd>
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={effectiveDisabled}
							onClick={() => {
								if (deleteTarget) handleDelete(deleteTarget);
								setDeleteTarget(null);
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
		</section>
	);
}
