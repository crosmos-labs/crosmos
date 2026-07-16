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

export function RemoveAccessDialog({
	viewerName,
	subjectName,
	onConfirm,
	onOpenChange,
}: {
	viewerName: string | null;
	subjectName: string;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<AlertDialog open={!!viewerName} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove access</AlertDialogTitle>
					<AlertDialogDescription>
						{viewerName ?? "This group"} will no longer be able to read memories
						created by {subjectName}. You can grant access again later.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={onConfirm}>
						Remove
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
