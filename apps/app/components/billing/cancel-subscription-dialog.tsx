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
import { formatDate } from "@/lib/format";

export function CancelSubscriptionDialog({
	open,
	onOpenChange,
	periodEnd,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	periodEnd: string | null;
	onConfirm: () => void;
}) {
	const until = periodEnd
		? formatDate(periodEnd)
		: "the end of your billing period";

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
					<AlertDialogDescription>
						You'll keep access until {until}. No refund.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">
						Keep subscription
					</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={onConfirm}>
						Cancel subscription
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
