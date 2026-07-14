"use client";

// TEMP: UI-state switcher so every billing state can be previewed without a
// matching Polar subscription. Delete this file after testing (grep "TEMP").

import { Button } from "@crosmos/ui/components/button";
import { Card } from "@crosmos/ui/components/card";
import { capitalize } from "@/lib/format";
import type {
	Payment,
	PaymentsResponse,
	Subscription,
} from "@/lib/types/billing";

export interface TempBillingState {
	view?: "skeleton" | "error";
	role?: "owner" | "admin" | "member";
	subscription?: Subscription;
	payments?: PaymentsResponse | "loading" | "error" | "empty";
}

function mockSub(
	status: Subscription["subscription_status"],
	extra: Partial<Subscription> = {},
): Subscription {
	return {
		plan: "pro",
		subscription_status: status,
		current_period_end: "2026-08-14T00:00:00Z",
		plan_pending: null,
		...extra,
	};
}

const SUBSCRIPTIONS: Record<string, Subscription> = {
	Free: mockSub("none", { plan: "free", current_period_end: null }),
	Active: mockSub("active"),
	"Past due": mockSub("past_due"),
	Canceled: mockSub("canceled"),
	Revoked: mockSub("revoked"),
	"Pending upgrade": mockSub("none", {
		plan: "free",
		current_period_end: null,
		plan_pending: "pro",
	}),
};

function mockPayment(overrides: Partial<Payment> & { id: string }): Payment {
	return {
		status: "paid",
		paid: true,
		created_at: "2026-07-01T00:00:00Z",
		subtotal_amount: 29900,
		discount_amount: 0,
		tax_amount: 0,
		total_amount: 29900,
		refunded_amount: 0,
		currency: "usd",
		billing_reason: "subscription_cycle",
		description: null,
		invoice_number: "CROSMOS-TEST-0001",
		invoice_available: true,
		product_name: "Pro",
		plan: "pro",
		...overrides,
	};
}

// One row per status, plus the null/fallback and refund edge cases. The
// pagination block claims 3 pages so prev/next renders.
const MOCK_PAYMENTS: PaymentsResponse = {
	payments: [
		mockPayment({ id: "temp-1" }),
		mockPayment({
			id: "temp-2",
			status: "pending",
			paid: false,
			billing_reason: "subscription_create",
			invoice_number: null,
			invoice_available: false,
		}),
		mockPayment({
			id: "temp-3",
			status: "partially_refunded",
			refunded_amount: 10000,
		}),
		mockPayment({ id: "temp-4", status: "refunded", refunded_amount: 29900 }),
		mockPayment({
			id: "temp-5",
			status: "void",
			paid: false,
			product_name: null,
			plan: null,
			invoice_available: false,
		}),
		mockPayment({
			id: "temp-6",
			status: "draft",
			paid: false,
			product_name: null,
			plan: "developer",
			subtotal_amount: 1900,
			total_amount: 1900,
			invoice_number: null,
			invoice_available: false,
		}),
	],
	pagination: { page: 1, limit: 20, total_count: 45, max_page: 3 },
};

const VIEWS: Record<string, TempBillingState["view"]> = {
	Skeleton: "skeleton",
	"Page error": "error",
};

const PAYMENTS: Record<string, TempBillingState["payments"]> = {
	Mock: MOCK_PAYMENTS,
	Loading: "loading",
	Error: "error",
	Empty: "empty",
};

const ROLES = ["owner", "admin", "member"] as const;

function Row({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-wrap items-center gap-1.5">
			<span className="w-24 text-xs text-muted-foreground">{label}</span>
			{children}
		</div>
	);
}

export function TempBillingStates({
	value,
	onChange,
}: {
	value: TempBillingState;
	onChange: (next: TempBillingState) => void;
}) {
	function set<K extends keyof TempBillingState>(
		key: K,
		v: TempBillingState[K],
	) {
		onChange({ ...value, [key]: value[key] === v ? undefined : v });
	}

	function StateButton<K extends keyof TempBillingState>({
		label,
		field,
		v,
	}: {
		label: string;
		field: K;
		v: TempBillingState[K];
	}) {
		return (
			<Button
				variant={value[field] === v ? "secondary" : "outline"}
				size="sm"
				onClick={() => set(field, v)}
			>
				{label}
			</Button>
		);
	}

	return (
		<Card className="gap-3 border-dashed p-4">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">TEMP · force UI states</span>
				<Button variant="ghost" size="sm" onClick={() => onChange({})}>
					Reset
				</Button>
			</div>
			<Row label="Page">
				{Object.entries(VIEWS).map(([label, v]) => (
					<StateButton key={label} label={label} field="view" v={v} />
				))}
			</Row>
			<Row label="Role">
				{ROLES.map((r) => (
					<StateButton key={r} label={capitalize(r)} field="role" v={r} />
				))}
			</Row>
			<Row label="Subscription">
				{Object.entries(SUBSCRIPTIONS).map(([label, s]) => (
					<StateButton key={label} label={label} field="subscription" v={s} />
				))}
			</Row>
			<Row label="Payments">
				{Object.entries(PAYMENTS).map(([label, p]) => (
					<StateButton key={label} label={label} field="payments" v={p} />
				))}
			</Row>
		</Card>
	);
}
