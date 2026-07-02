import { capitalize, formatDate } from "@/lib/format";
import type { Subscription } from "@/lib/types/billing";

export type BillingTone = "neutral" | "warn" | "danger";

export interface BillingStatusBadge {
	label: string;
	variant: "secondary" | "destructive" | "outline";
}

export interface BillingStatusDisplay {
	label: string;
	detail: string | null;
	tone: BillingTone;
	badge: BillingStatusBadge | null;
}

export function billingStatusDisplay(sub: Subscription): BillingStatusDisplay {
	const planLabel = `${capitalize(sub.plan)} plan`;
	const cpe = sub.current_period_end;

	switch (sub.subscription_status) {
		case "active":
			return {
				label: planLabel,
				detail: cpe ? `Renews ${formatDate(cpe)}` : "Renews automatically",
				tone: "neutral",
				badge: { label: "Active", variant: "secondary" },
			};
		case "past_due":
			return {
				label: planLabel,
				detail: `Your last payment failed. Update your card to keep your ${capitalize(sub.plan)} plan.`,
				tone: "danger",
				badge: { label: "Past due", variant: "destructive" },
			};
		case "canceled":
			return {
				label: planLabel,
				detail: cpe ? `Ends ${formatDate(cpe)}` : "Ends at period end",
				tone: "warn",
				badge: { label: "Canceled", variant: "outline" },
			};
		case "revoked":
			return {
				label: "Free plan",
				detail: "Your subscription ended",
				tone: "neutral",
				badge: { label: "Expired", variant: "secondary" },
			};
		default:
			return { label: "Free plan", detail: null, tone: "neutral", badge: null };
	}
}

export function billingToneClass(tone: BillingTone): string {
	switch (tone) {
		case "danger":
			return "text-destructive";
		case "warn":
			return "text-amber-500";
		default:
			return "text-muted-foreground";
	}
}
