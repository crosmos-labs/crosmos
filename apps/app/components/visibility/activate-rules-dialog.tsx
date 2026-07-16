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
import { IconShieldCheck, IconUsersGroup } from "@tabler/icons-react";

export function ActivateRulesDialog({
	open,
	onOpenChange,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Activate group access rules?</AlertDialogTitle>
					<AlertDialogDescription>
						Saved rules will start granting access to private memories
						immediately.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="flex flex-col gap-2">
					<div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
						<IconShieldCheck className="mt-0.5 text-muted-foreground" />
						<div className="flex min-w-0 flex-col gap-1">
							<span className="text-sm font-medium">
								Saved grants become active
							</span>
							<span className="text-sm text-muted-foreground">
								Private memories remain private by default, but group grants can
								add readers.
							</span>
						</div>
					</div>
					<div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
						<IconUsersGroup className="mt-0.5 text-muted-foreground" />
						<div className="flex min-w-0 flex-col gap-1">
							<span className="text-sm font-medium">Access may broaden</span>
							<span className="text-sm text-muted-foreground">
								Members in viewer groups can read private memories owned by
								subject groups, including transitive grants.
							</span>
						</div>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>
						Activate rules
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
