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
import { formatDate } from "@/lib/format";

export function CancelSubscriptionDialog({
	open,
	onOpenChange,
	currentPeriodEnd,
	busy,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentPeriodEnd: string | null;
	busy: boolean;
	onConfirm: () => void;
}) {
	const endLabel = currentPeriodEnd
		? formatDate(currentPeriodEnd)
		: "the end of the billing period";

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Cancel subscription</AlertDialogTitle>
					<AlertDialogDescription>
						You'll keep full access until {endLabel}. No refund is issued for
						the current period, and you can resume anytime before then.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">
						Keep plan <Kbd>Esc</Kbd>
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={busy}
						onClick={onConfirm}
					>
						Cancel subscription{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
