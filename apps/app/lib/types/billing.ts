export type Plan = "free" | "developer" | "pro" | "enterprise";
export type PurchasablePlan = "developer" | "pro";
export type PlanAvailability = "live" | "coming_soon";
export type SubscriptionStatus =
	| "none"
	| "active"
	| "past_due"
	| "canceled"
	| "revoked";

// Numeric quota fields use -1 for unlimited.
export interface PlanInfo {
	plan: Plan;
	price_usd: number;
	max_memory_spaces: number;
	monthly_tokens_ingested: number;
	monthly_search_queries: number;
	status: PlanAvailability;
}

export interface PlansResponse {
	plans: PlanInfo[];
}

export interface Subscription {
	plan: Plan;
	subscription_status: SubscriptionStatus;
	current_period_end: string | null;
	plan_pending: string | null;
}

export interface CheckoutResponse {
	checkout_url: string;
}

export interface PortalResponse {
	portal_url: string;
}

export interface CancelResponse {
	cancel_at_period_end: boolean;
	subscription_status: SubscriptionStatus;
}

export const PLAN_ORDER: Plan[] = ["free", "developer", "pro", "enterprise"];

export const RECOMMENDED_PLAN: Plan = "pro";
