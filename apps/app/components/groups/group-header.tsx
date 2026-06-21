"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { deleteGroup } from "@/actions/visibility";
import { DeleteGroupDialog } from "@/components/groups/delete-group-dialog";
import { GroupAvatar } from "@/components/groups/group-avatar";
import { visibilityGroupsKey } from "@/hooks/use-visibility";
import { optimisticRemove } from "@/lib/optimistic";
import type { VisibilityGroup } from "@/lib/types/visibility";

export function GroupHeader({
	orgId,
	group,
	backHref,
	onDeleting,
}: {
	orgId: string;
	group: VisibilityGroup;
	backHref: string;
	onDeleting?: () => void;
}) {
	const router = useRouter();
	const { mutate } = useSWRConfig();
	const [deleteOpen, setDeleteOpen] = useState(false);

	function handleDelete() {
		setDeleteOpen(false);
		// Leave the detail page before the group drops out of the list cache, and run
		// the delete outside runAction so its loading state can't hold the navigation.
		onDeleting?.();
		router.push(backHref);
		optimisticRemove<VisibilityGroup>(
			mutate,
			visibilityGroupsKey(orgId),
			(g) => g.id === group.id,
			() => deleteGroup(orgId, group.id),
		)
			.then(() => toast.success("Group deleted"))
			.catch(() => toast.error("Failed to delete group"));
	}

	return (
		<div className="flex items-center gap-4">
			<GroupAvatar name={group.name} seed={group.slug} size="lg" />
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<h1 className="truncate text-xl font-semibold tracking-tight">
					{group.name}
				</h1>
				<p className="text-sm text-muted-foreground">
					{group.member_count} member{group.member_count === 1 ? "" : "s"}
				</p>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Open group actions"
						className="focus:ring-0 focus-visible:ring-0"
					>
						<IconDotsVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuGroup>
						<DropdownMenuItem
							variant="destructive"
							onClick={() => setDeleteOpen(true)}
						>
							<IconTrash />
							Delete group
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteGroupDialog
				group={deleteOpen ? group : null}
				onDelete={handleDelete}
				onOpenChange={(open) => {
					if (!open) setDeleteOpen(false);
				}}
			/>
		</div>
	);
}
