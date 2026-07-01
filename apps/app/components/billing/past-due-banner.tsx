"use client";

import { Alert, AlertDescription } from "@crosmos/ui/components/alert";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { useSubscription } from "@/hooks/use-billing";
import { useCurrentUser } from "@/hooks/use-current-user";

export function PastDueBanner() {
	const { data: user } = useCurrentUser();
	const { data: subscription } = useSubscription();
	const [dismissed, setDismissed] = useState(false);

	const show =
		!dismissed &&
		user?.active_org?.your_role === "owner" &&
		subscription?.subscription_status === "past_due";

	if (!show) return null;

	return (
		<Alert className="shrink-0 rounded-none border-x-0 border-t-0 border-b border-destructive/20 bg-destructive/10 py-2">
			<AlertDescription className="flex items-center justify-center gap-2 text-sm text-foreground">
				<IconAlertTriangle className="size-4 shrink-0 text-destructive" />
				<span>
					Your payment failed. Update your card to keep your subscription.
				</span>
				<Link
					href="/billing"
					className="font-medium underline underline-offset-4"
				>
					Go to billing
				</Link>
				<button
					type="button"
					onClick={() => setDismissed(true)}
					aria-label="Dismiss"
					className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
				>
					<IconX className="size-4" />
				</button>
			</AlertDescription>
		</Alert>
	);
}
