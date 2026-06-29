"use client";

import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { Spinner } from "@crosmos/ui/components/spinner";
import { capitalize, formatDate } from "@/lib/format";
import type { Plan, Subscription } from "@/lib/types/billing";
import type { OrgRole } from "@/lib/types/org";

function statusBadge(status: Subscription["subscription_status"]) {
	switch (status) {
		case "active":
			return <Badge>Active</Badge>;
		case "past_due":
			return <Badge variant="destructive">Past due</Badge>;
		case "canceled":
			return (
				<Badge
					variant="secondary"
					className="text-amber-600 dark:text-amber-500"
				>
					Ending
				</Badge>
			);
		default:
			return <Badge variant="secondary">Free</Badge>;
	}
}

function dateLabel(sub: Subscription): string | null {
	if (!sub.current_period_end) return null;
	const date = formatDate(sub.current_period_end);
	if (sub.subscription_status === "active") return `Renews on ${date}`;
	if (sub.subscription_status === "canceled") return `Access until ${date}`;
	if (sub.subscription_status === "past_due") return `Payment due ${date}`;
	return null;
}

export function BillingStatusStrip({
	subscription,
	currentPlan,
	role,
	busy,
	onManage,
	onCancel,
	onResume,
}: {
	subscription: Subscription | null;
	currentPlan: Plan;
	role: OrgRole | null;
	busy: boolean;
	onManage: () => void;
	onCancel: () => void;
	onResume: () => void;
}) {
	const isOwner = role === "owner";

	if (!subscription) {
		return (
			<Item variant="outline" className="px-4 py-3.5">
				<ItemContent>
					<ItemTitle className="text-base">
						{capitalize(currentPlan)} plan
					</ItemTitle>
					<ItemDescription>Contact an owner to manage billing.</ItemDescription>
				</ItemContent>
			</Item>
		);
	}

	const status = subscription.subscription_status;
	const pending = subscription.plan_pending;
	const live = status === "active" || status === "past_due";
	const label = dateLabel(subscription);

	return (
		<Item variant="outline" className="px-4 py-3.5">
			<ItemContent>
				<ItemTitle className="flex items-center gap-2 text-base">
					{capitalize(subscription.plan)} plan
					{statusBadge(status)}
				</ItemTitle>
				<ItemDescription>
					{pending ? (
						<span className="flex items-center gap-1.5">
							<Spinner className="size-3.5" />
							Upgrading to {capitalize(pending)}…
						</span>
					) : (
						(label ??
						(status === "revoked"
							? "Your previous plan ended."
							: "No active subscription."))
					)}
				</ItemDescription>
			</ItemContent>
			{isOwner && !pending && (live || status === "canceled") && (
				<ItemActions>
					<Button
						variant="outline"
						size="sm"
						disabled={busy}
						onClick={onManage}
					>
						Manage billing
					</Button>
					{status === "canceled" ? (
						<Button size="sm" disabled={busy} onClick={onResume}>
							Resume
						</Button>
					) : (
						<Button
							variant="ghost"
							size="sm"
							disabled={busy}
							onClick={onCancel}
						>
							Cancel
						</Button>
					)}
				</ItemActions>
			)}
		</Item>
	);
}

export function StatusStripSkeleton() {
	return (
		<Item variant="outline" className="px-4 py-3.5">
			<ItemContent>
				<ItemTitle className="flex h-6 items-center gap-2 text-base">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-5 w-14 rounded-full" />
				</ItemTitle>
				<ItemDescription as="div" className="flex h-5 items-center">
					<Skeleton className="h-3.5 w-40" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-7 w-28" />
			</ItemActions>
		</Item>
	);
}
