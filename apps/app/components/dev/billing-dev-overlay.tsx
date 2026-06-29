"use client";

import { useEffect, useState } from "react";
import { SWRConfig, useSWRConfig } from "swr";
import BillingPage from "@/app/(dashboard)/billing/page";
import { plansKey, subscriptionKey } from "@/hooks/use-billing";
import { useCurrentUser } from "@/hooks/use-current-user";
import { orgKey } from "@/hooks/use-org";
import { usageKey } from "@/hooks/use-usage";
import type { AuthUser } from "@/lib/types/auth";
import type { Plan, PlanInfo, SubscriptionStatus } from "@/lib/types/billing";
import type { OrgDetailResponse, OrgRole } from "@/lib/types/org";
import type { Usage, UsageMetric } from "@/lib/types/usage";

const ORG_ID = "dev-org";

const FREE_PLAN: PlanInfo = {
	plan: "free",
	price_usd: 0,
	max_memory_spaces: 3,
	monthly_tokens_ingested: 500_000,
	monthly_search_queries: 5_000,
	status: "live",
};

const DEV_PLANS: PlanInfo[] = [
	FREE_PLAN,
	{
		plan: "developer",
		price_usd: 19,
		max_memory_spaces: 7,
		monthly_tokens_ingested: 5_000_000,
		monthly_search_queries: 50_000,
		status: "live",
	},
	{
		plan: "pro",
		price_usd: 299,
		max_memory_spaces: 50,
		monthly_tokens_ingested: 80_000_000,
		monthly_search_queries: 300_000,
		status: "live",
	},
	{
		plan: "enterprise",
		price_usd: 0,
		max_memory_spaces: -1,
		monthly_tokens_ingested: -1,
		monthly_search_queries: -1,
		status: "coming_soon",
	},
];

interface Scenario {
	status: SubscriptionStatus;
	plan: Plan;
	role: OrgRole;
	hasBillingEmail: boolean;
	hasPeriodEnd: boolean;
	planPending: "" | "developer" | "pro";
	usage: "low" | "warn" | "over";
}

const DEFAULT_SCENARIO: Scenario = {
	status: "active",
	plan: "pro",
	role: "owner",
	hasBillingEmail: true,
	hasPeriodEnd: true,
	planPending: "",
	usage: "low",
};

function metric(limit: number, frac: number): UsageMetric {
	if (limit === -1) return { used: 1_000, limit: -1, remaining: -1 };
	const used = Math.round(limit * frac);
	return { used, limit, remaining: Math.max(limit - used, 0) };
}

function buildUsage(s: Scenario): Usage {
	const cat = DEV_PLANS.find((p) => p.plan === s.plan) ?? FREE_PLAN;
	const frac = s.usage === "low" ? 0.1 : s.usage === "warn" ? 0.8 : 1.1;
	const now = Date.now();
	return {
		plan: s.plan,
		period_start: new Date(now).toISOString(),
		period_end: new Date(now + 30 * 86_400_000).toISOString(),
		tokens: metric(cat.monthly_tokens_ingested, frac),
		queries: metric(cat.monthly_search_queries, frac),
		spaces: metric(cat.max_memory_spaces, frac),
		rate_limit_rpm: 60,
		rate_limit_per_day: 5_000,
	};
}

function buildFallback(s: Scenario): Record<string, unknown> {
	const periodEnd = s.hasPeriodEnd
		? new Date(Date.now() + 26 * 86_400_000).toISOString()
		: null;
	const user: AuthUser = {
		user_id: "dev-user",
		email: "dev@crosmos.dev",
		name: "Dev User",
		active_org_id: ORG_ID,
		active_org: { id: ORG_ID, slug: "dev", name: "Dev Org", your_role: s.role },
	};
	const org: OrgDetailResponse = {
		id: ORG_ID,
		slug: "dev",
		name: "Dev Org",
		plan: s.plan,
		billing_email: s.hasBillingEmail ? "billing@crosmos.dev" : null,
		created_at: new Date(0).toISOString(),
		updated_at: new Date(0).toISOString(),
		member_count: 1,
		your_role: s.role,
	};
	return {
		"/auth/me": user,
		[orgKey(ORG_ID)]: org,
		[subscriptionKey(ORG_ID)]: {
			plan: s.plan,
			subscription_status: s.status,
			current_period_end: periodEnd,
			plan_pending: s.planPending || null,
		},
		[plansKey(ORG_ID)]: DEV_PLANS,
		[usageKey(ORG_ID)]: buildUsage(s),
	};
}

function Field({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: string[];
	onChange: (v: string) => void;
}) {
	return (
		<label className="flex items-center justify-between gap-2 text-xs">
			<span className="text-muted-foreground">{label}</span>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="rounded border border-border bg-background px-1.5 py-0.5 text-foreground"
			>
				{options.map((o) => (
					<option key={o} value={o}>
						{o}
					</option>
				))}
			</select>
		</label>
	);
}

export function BillingDevOverlay() {
	const [s, setS] = useState<Scenario>(DEFAULT_SCENARIO);
	const set = <K extends keyof Scenario>(key: K, v: Scenario[K]) =>
		setS((prev) => ({ ...prev, [key]: v }));
	const scenarioKey = JSON.stringify(s);

	// The past-due banner lives in the dashboard layout (outside this overlay's
	// seeded cache), so drive the REAL subscription key to preview its full-bleed
	// position. Restored on unmount.
	const { data: realUser } = useCurrentUser();
	const realOrgId = realUser?.active_org_id ?? null;
	const { mutate: globalMutate } = useSWRConfig();

	useEffect(() => {
		if (!realOrgId) return;
		const periodEnd = s.hasPeriodEnd
			? new Date(Date.now() + 26 * 86_400_000).toISOString()
			: null;
		globalMutate(
			subscriptionKey(realOrgId),
			s.status === "past_due"
				? {
						plan: s.plan,
						subscription_status: "past_due",
						current_period_end: periodEnd,
						plan_pending: null,
					}
				: undefined,
			{ revalidate: false },
		);
	}, [s.status, s.plan, s.hasPeriodEnd, realOrgId, globalMutate]);

	useEffect(() => {
		return () => {
			if (realOrgId) globalMutate(subscriptionKey(realOrgId));
		};
	}, [realOrgId, globalMutate]);

	return (
		<>
			<SWRConfig
				key={scenarioKey}
				value={{
					provider: () => new Map(),
					fallback: buildFallback(s),
					isVisible: () => false,
					isOnline: () => false,
					revalidateOnMount: false,
					revalidateIfStale: false,
					revalidateOnFocus: false,
					revalidateOnReconnect: false,
				}}
			>
				<BillingPage />
			</SWRConfig>

			<div className="fixed right-4 bottom-4 z-50 flex w-60 flex-col gap-2 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-lg">
				<div className="text-xs font-semibold">Billing dev states</div>
				<Field
					label="status"
					value={s.status}
					options={["none", "active", "past_due", "canceled", "revoked"]}
					onChange={(v) => set("status", v as SubscriptionStatus)}
				/>
				<Field
					label="plan"
					value={s.plan}
					options={["free", "developer", "pro", "enterprise"]}
					onChange={(v) => set("plan", v as Plan)}
				/>
				<Field
					label="role"
					value={s.role}
					options={["owner", "admin", "member"]}
					onChange={(v) => set("role", v as OrgRole)}
				/>
				<Field
					label="plan_pending"
					value={s.planPending}
					options={["", "developer", "pro"]}
					onChange={(v) => set("planPending", v as Scenario["planPending"])}
				/>
				<Field
					label="usage"
					value={s.usage}
					options={["low", "warn", "over"]}
					onChange={(v) => set("usage", v as Scenario["usage"])}
				/>
				<Field
					label="billing_email"
					value={s.hasBillingEmail ? "set" : "empty"}
					options={["set", "empty"]}
					onChange={(v) => set("hasBillingEmail", v === "set")}
				/>
				<Field
					label="period_end"
					value={s.hasPeriodEnd ? "date" : "null"}
					options={["date", "null"]}
					onChange={(v) => set("hasPeriodEnd", v === "date")}
				/>
				<div className="mt-1 flex flex-col gap-1 border-t border-border pt-2 text-xs">
					<span className="text-muted-foreground">success page:</span>
					<div className="flex gap-1">
						{["finalizing", "active", "timeout"].map((p) => (
							<a
								key={p}
								href={`/billing/success?dev_phase=${p}`}
								className="rounded border border-border px-1.5 py-0.5 hover:bg-muted"
							>
								{p}
							</a>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
