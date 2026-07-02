"use client";

import { Button } from "@crosmos/ui/components/button";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { cancelSubscription } from "@/actions/billing";
import { CancelSubscriptionDialog } from "@/components/billing/cancel-subscription-dialog";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { subscriptionKey } from "@/hooks/use-billing";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toastBillingError } from "@/lib/billing-errors";

export function CancelSubscriptionButton({
	periodEnd,
}: {
	periodEnd: string | null;
}) {
	const { runAction, state } = useActionLoader();
	const { mutate } = useSWRConfig();
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const busy = state.activeCount > 0;
	const [open, setOpen] = useState(false);

	async function onConfirm() {
		setOpen(false);
		try {
			await runAction(async () => {
				const res = await cancelSubscription();
				if (!res.ok) throw new Error(res.message);
				if (orgId) await mutate(subscriptionKey(orgId));
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "";
			if (
				msg.includes("no_active_subscription") ||
				msg.includes("already_canceled")
			) {
				if (orgId) mutate(subscriptionKey(orgId));
			} else {
				toastBillingError(
					err,
					"Couldn't cancel your subscription. Please try again.",
				);
			}
		}
	}

	return (
		<>
			<Button
				variant="ghost"
				className="text-muted-foreground"
				disabled={busy}
				onClick={() => setOpen(true)}
			>
				Cancel subscription
			</Button>
			<CancelSubscriptionDialog
				open={open}
				onOpenChange={setOpen}
				periodEnd={periodEnd}
				onConfirm={onConfirm}
			/>
		</>
	);
}
