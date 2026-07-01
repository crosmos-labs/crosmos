"use client";

import { Button } from "@crosmos/ui/components/button";
import { Spinner } from "@crosmos/ui/components/spinner";
import Link from "next/link";
import { PurchaseGraphic } from "@/components/billing/purchase-graphic";
import { useSubscriptionActivation } from "@/hooks/use-billing";
import { capitalize, formatDate } from "@/lib/format";

export default function BillingSuccessPage() {
	const { phase, subscription } = useSubscriptionActivation();

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
			<PurchaseGraphic className="size-20 text-muted-foreground" />

			{phase === "finalizing" && (
				<div className="flex flex-col items-center gap-2">
					<div className="flex items-center gap-2">
						<Spinner className="size-4" />
						<h1 className="text-lg font-semibold tracking-tight">
							{subscription?.plan_pending
								? `Finalizing your upgrade to ${capitalize(subscription.plan_pending)}…`
								: "Finalizing your upgrade…"}
						</h1>
					</div>
					<p className="text-sm text-muted-foreground">
						This usually takes a few seconds.
					</p>
				</div>
			)}

			{phase === "active" && (
				<div className="flex flex-col items-center gap-4">
					<div className="flex flex-col gap-1">
						<h1 className="text-lg font-semibold tracking-tight">
							You're on the {capitalize(subscription?.plan ?? "free")} plan.
						</h1>
						{subscription?.current_period_end && (
							<p className="text-sm text-muted-foreground">
								Renews {formatDate(subscription.current_period_end)}.
							</p>
						)}
					</div>
					<Button asChild>
						<Link href="/billing">Go to billing</Link>
					</Button>
				</div>
			)}

			{phase === "timeout" && (
				<div className="flex flex-col items-center gap-4">
					<div className="flex flex-col gap-1">
						<h1 className="text-lg font-semibold tracking-tight">
							We're still finalizing your upgrade.
						</h1>
						<p className="text-sm text-muted-foreground">
							It can take a moment. Your plan will update automatically.
						</p>
					</div>
					<div className="flex items-center gap-2.5">
						<Button asChild>
							<Link href="/billing">Go to billing</Link>
						</Button>
						<Button variant="ghost" asChild>
							<a href="mailto:support@crosmos.dev">Contact support</a>
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
