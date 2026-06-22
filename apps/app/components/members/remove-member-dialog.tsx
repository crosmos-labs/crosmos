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
import { Kbd } from "@crosmos/ui/components/kbd";
import { IconCornerDownLeft } from "@tabler/icons-react";
import { LAST_OWNER_MSG } from "@/lib/members";

export function RemoveMemberDialog({
	open,
	onOpenChange,
	isSelf,
	isLastOwner,
	targetName,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isSelf: boolean;
	isLastOwner: boolean;
	targetName: string | undefined;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isSelf ? "Leave organization" : "Remove from organization"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						{isLastOwner
							? LAST_OWNER_MSG
							: isSelf
								? "You'll lose access to this organization and its memory. You can rejoin later only via a new invitation."
								: `${targetName ?? "This member"} will lose access to this organization. This can't be undone.`}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">
						Cancel <Kbd>Esc</Kbd>
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={isLastOwner}
						onClick={onConfirm}
					>
						{isSelf ? "Leave" : "Remove"}{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
