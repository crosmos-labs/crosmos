"use client";

import { Button } from "@crosmos/ui/components/button";
import { toast } from "sonner";
import { openPortal } from "@/actions/billing";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { markPortalReturn } from "@/hooks/use-billing";

export function ManageSubscriptionButton() {
	const { runAction, state } = useActionLoader();
	const busy = state.activeCount > 0;

	async function onManage() {
		try {
			await runAction(async () => {
				const res = await openPortal();
				if (!res.ok) throw new Error(res.message);
				if (!res.data.portal_url) throw new Error("missing_portal_url");
				markPortalReturn();
				window.location.assign(res.data.portal_url);
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "";
			if (msg.includes("rate_limited")) {
				toast.error("Too many attempts. Try again shortly.");
			} else if (msg.includes("provider_error")) {
				toast.error("Payment provider error. Please try again.");
			} else if (msg.includes("no_customer")) {
				toast.error("No billing account on file.");
			} else {
				toast.error("Couldn't open the billing portal. Please try again.");
			}
		}
	}

	return (
		<Button variant="outline" disabled={busy} onClick={onManage}>
			Manage subscription
		</Button>
	);
}
