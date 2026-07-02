"use client";

import { Badge } from "@crosmos/ui/components/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { CancelSubscriptionButton } from "@/components/billing/cancel-subscription-button";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { billingStatusDisplay, billingToneClass } from "@/lib/billing-status";
import type { Subscription } from "@/lib/types/billing";

export function SubscriptionPanel({
	subscription,
	canManage = false,
}: {
	subscription: Subscription;
	canManage?: boolean;
}) {
	const status = subscription.subscription_status;
	// Free with no history carries no useful info, so skip the panel entirely.
	if (status === "none") return null;

	const { label, detail, tone, badge } = billingStatusDisplay(subscription);
	const showManage =
		canManage &&
		(status === "active" || status === "past_due" || status === "canceled");
	const showCancel =
		canManage && (status === "active" || status === "past_due");

	return (
		<ItemGroup>
			<Item variant="outline" className="px-4 py-3.5">
				<ItemContent>
					<ItemTitle className="text-base">
						{label}
						{badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
					</ItemTitle>
					{detail && (
						<ItemDescription className={billingToneClass(tone)}>
							{detail}
						</ItemDescription>
					)}
				</ItemContent>
				{showManage && (
					<ItemActions>
						{showCancel && (
							<CancelSubscriptionButton
								periodEnd={subscription.current_period_end}
							/>
						)}
						<ManageSubscriptionButton />
					</ItemActions>
				)}
			</Item>
		</ItemGroup>
	);
}
