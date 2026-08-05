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
	cancel_at_period_end: true;
	subscription_status: SubscriptionStatus;
}

export const PLAN_ORDER: Plan[] = ["free", "developer", "pro", "enterprise"];

export type PaymentStatus =
	| "draft"
	| "pending"
	| "paid"
	| "refunded"
	| "partially_refunded"
	| "void";

// Amount fields are minor units (cents) of `currency`, matching Polar.
export interface Payment {
	id: string;
	status: PaymentStatus;
	paid: boolean;
	created_at: string;
	subtotal_amount: number;
	discount_amount: number;
	tax_amount: number;
	total_amount: number;
	refunded_amount: number;
	currency: string;
	billing_reason: string;
	description: string | null;
	invoice_number: string | null;
	invoice_available: boolean;
	product_name: string | null;
	plan: Plan | null;
}

export interface PaymentsResponse {
	payments: Payment[];
	pagination: {
		page: number;
		limit: number;
		total_count: number;
		max_page: number;
	};
}

// 202 = invoice generation triggered; retry shortly.
export type InvoiceResult = { invoice_url: string } | { status: "generating" };
