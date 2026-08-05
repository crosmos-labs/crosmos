"use client";

import { Alert, AlertDescription } from "@crosmos/ui/components/alert";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { useSubscription } from "@/hooks/use-billing";
import { useOrgRole } from "@/hooks/use-org-role";

export function PastDueBanner() {
	const { orgId, role } = useOrgRole();
	const { data: subscription } = useSubscription();

	// Scope dismissal to the org: switching orgs (or a token refresh that swaps
	// the user) re-evaluates the banner instead of staying hidden. SWR keeps the
	// previous data during revalidation, so focus/cache refreshes never flicker
	// it; only an actual org switch (new key) clears the data.
	const [dismissedOrg, setDismissedOrg] = useState<string | null>(null);

	const show =
		orgId !== null &&
		dismissedOrg !== orgId &&
		role === "owner" &&
		subscription?.subscription_status === "past_due";

	return (
		<AnimatePresence initial={false}>
			{show && (
				<motion.div
					initial={{ height: 0, opacity: 0 }}
					animate={{ height: "auto", opacity: 1 }}
					exit={{ height: 0, opacity: 0 }}
					transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
					className="shrink-0 overflow-hidden"
				>
					<Alert className="rounded-none border-x-0 border-t-0 border-b border-destructive/20 bg-destructive/10 py-2">
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
								onClick={() => setDismissedOrg(orgId)}
								aria-label="Dismiss"
								className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
							>
								<IconX className="size-4" />
							</button>
						</AlertDescription>
					</Alert>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
