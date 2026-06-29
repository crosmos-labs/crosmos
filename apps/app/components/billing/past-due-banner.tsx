"use client";

import { Alert, AlertDescription } from "@crosmos/ui/components/alert";
import { IconAlertTriangle } from "@tabler/icons-react";
import Link from "next/link";
import { useSubscription } from "@/hooks/use-billing";

export function PastDueBanner() {
	const { data: subscription } = useSubscription();

	if (subscription?.subscription_status !== "past_due") return null;

	return (
		<Alert
			variant="destructive"
			className="shrink-0 rounded-none border-x-0 border-t-0 border-b py-1.5"
		>
			<AlertDescription className="flex items-center justify-center gap-2 text-sm text-destructive/90">
				<IconAlertTriangle className="size-4" />
				<span>
					Payment failed — we couldn't process your last payment.{" "}
					<Link
						href="/billing"
						className="font-medium underline underline-offset-2"
					>
						Update your payment method
					</Link>{" "}
					to keep your subscription active.
				</span>
			</AlertDescription>
		</Alert>
	);
}
