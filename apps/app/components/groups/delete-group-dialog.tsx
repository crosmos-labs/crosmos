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
import type { VisibilityGroup } from "@/lib/types/visibility";

export function DeleteGroupDialog({
	group,
	onDelete,
	onOpenChange,
}: {
	group: VisibilityGroup | null;
	onDelete: (groupId: string) => void;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<AlertDialog open={!!group} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete group</AlertDialogTitle>
					<AlertDialogDescription>
						{group?.name ?? "This group"} and its access rules will be removed.
						Members keep their workspace access. This can't be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => group && onDelete(group.id)}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
