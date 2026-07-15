"use client";

import { Button } from "@crosmos/ui/components/button";
import { useState } from "react";
import { toast } from "sonner";
import { openPortal } from "@/actions/billing";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { markPortalReturn } from "@/hooks/use-billing";
import { toastBillingError } from "@/lib/billing-errors";
import type { SubscriptionStatus } from "@/lib/types/billing";

// The portal is the only path for plan changes and resume until the backend
// exposes them, so the label names the journey, not the destination.
const PORTAL_LABELS: Partial<Record<SubscriptionStatus, string>> = {
	active: "Change plan",
	canceled: "Resume subscription",
	past_due: "Update payment method",
};

export function ManageSubscriptionButton({
	status,
}: {
	status: SubscriptionStatus;
}) {
	const { runAction, state } = useActionLoader();
	// Stays true until the page unloads, so the button can't fire twice
	// while the portal navigation is in flight.
	const [redirecting, setRedirecting] = useState(false);
	const busy = state.activeCount > 0 || redirecting;

	async function onManage() {
		try {
			await runAction(async () => {
				const res = await openPortal();
				if (!res.ok) throw new Error(res.message);
				if (!res.data.portal_url) throw new Error("missing_portal_url");
				markPortalReturn();
				setRedirecting(true);
				window.location.assign(res.data.portal_url);
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "";
			if (msg.includes("no_customer")) {
				toast.error("No billing account on file.");
			} else {
				toastBillingError(
					err,
					"Couldn't open the billing portal. Please try again.",
				);
			}
		}
	}

	return (
		<Button
			variant="ghost"
			className="text-muted-foreground"
			disabled={busy}
			onClick={onManage}
		>
			{PORTAL_LABELS[status] ?? "Manage subscription"}
		</Button>
	);
}
