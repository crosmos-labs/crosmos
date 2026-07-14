"use client";

import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { useState } from "react";
import { CancelSubscriptionButton } from "@/components/billing/cancel-subscription-button";
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button";
import { UpgradePlanDialog } from "@/components/billing/upgrade-plan-dialog";
import { billingStatusDisplay, billingToneClass } from "@/lib/billing-status";
import { capitalize } from "@/lib/format";
import type { Subscription } from "@/lib/types/billing";

export function SubscriptionPanel({
	subscription,
	canManage = false,
}: {
	subscription: Subscription;
	canManage?: boolean;
}) {
	const status = subscription.subscription_status;
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	const { label, detail, tone, badge } = billingStatusDisplay(subscription);
	const showManage =
		canManage &&
		(status === "active" || status === "past_due" || status === "canceled");
	const showCancel =
		canManage && (status === "active" || status === "past_due");
	// Status-based, not plan-based: a revoked org keeps its old plan name but is
	// effectively free and starts a fresh checkout.
	const freeTier = status === "none" || status === "revoked";
	const pendingPlan = subscription.plan_pending;
	const canUpgrade = canManage && freeTier && !pendingPlan;

	return (
		<ItemGroup>
			<Item variant="outline" className="px-4 py-3.5">
				<ItemContent>
					<ItemTitle className="text-base">
						{label}
						{badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
						{freeTier && pendingPlan && (
							<Badge variant="secondary">
								Upgrading to {capitalize(pendingPlan)}…
							</Badge>
						)}
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
				{canUpgrade && (
					<ItemActions>
						<Button onClick={() => setUpgradeOpen(true)}>Upgrade</Button>
					</ItemActions>
				)}
			</Item>
			{canUpgrade && (
				<UpgradePlanDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
			)}
		</ItemGroup>
	);
}
