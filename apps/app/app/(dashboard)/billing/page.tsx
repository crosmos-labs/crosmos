"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@crosmos/ui/components/alert";
import { IconClockExclamation } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import {
	cancelSubscription,
	getSubscription,
	openPortal,
	startCheckout,
} from "@/actions/billing";
import { updateOrg } from "@/actions/orgs";
import { BillingEmailDialog } from "@/components/billing/billing-email-dialog";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";
import { CancelSubscriptionDialog } from "@/components/billing/cancel-subscription-dialog";
import { PlanCards } from "@/components/billing/plan-cards";
import { SpacesMeter } from "@/components/billing/spaces-meter";
import { BillingStatusStrip } from "@/components/billing/status-strip";
import { UsageMeter } from "@/components/billing/usage-meter";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import {
	plansKey,
	subscriptionKey,
	usePlans,
	useSubscription,
} from "@/hooks/use-billing";
import { useCurrentUser } from "@/hooks/use-current-user";
import { orgKey, useOrg } from "@/hooks/use-org";
import { usageKey, useUsage } from "@/hooks/use-usage";
import type { ActionResult } from "@/lib/action-result";
import { formatDate } from "@/lib/format";
import { pollUntil } from "@/lib/poll";
import type { Plan, PurchasablePlan } from "@/lib/types/billing";

const PENDING_PLAN_KEY = "billing:pending_plan";

// Backend billing errors carry the machine string in `detail` (no `code` field),
// surfaced as ActionResult.message. Match on these rather than result.code.
const BILLING_DETAIL = {
	noCustomer: "no_customer_on_file",
	noActiveSubscription: "no_active_subscription",
	alreadyCanceled: "subscription_already_canceled",
} as const;

function billingErrorToast(result: {
	status: number;
	code: string | null;
	message: string;
}) {
	if (result.status === 429) {
		toast.error("Too many attempts — please try again shortly.");
		return;
	}
	if (result.status === 502) {
		toast.error("Billing is temporarily unavailable. Please try again.");
		return;
	}
	if (result.status === 403) {
		toast.error("You don't have permission to manage billing.");
		return;
	}
	toast.error(result.message || "Something went wrong.");
}

export default function BillingPage() {
	const { mutate } = useSWRConfig();
	const orgId = useActiveOrgId();
	const { data: user } = useCurrentUser();
	const role = user?.active_org?.your_role ?? null;
	const isMember = role === "member";

	const {
		data: subscription,
		error: subError,
		isLoading: subLoading,
	} = useSubscription();
	const {
		data: plans,
		error: plansError,
		isLoading: plansLoading,
	} = usePlans();
	const { data: org } = useOrg(orgId);
	const {
		data: usage,
		error: usageError,
		isLoading: usageLoading,
	} = useUsage();

	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const [redirecting, setRedirecting] = useState(false);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [emailOpen, setEmailOpen] = useState(false);
	const [pendingPlan, setPendingPlan] = useState<PurchasablePlan | null>(null);

	const busy = activeCount > 0 || redirecting;
	const currentPlan: Plan =
		subscription?.plan ?? (usage?.plan as Plan | undefined) ?? "free";

	function go(url: string) {
		setRedirecting(true);
		window.location.href = url;
	}

	function handleCheckoutError(result: ActionResult<unknown> & { ok: false }) {
		if (result.message.includes("billing_email")) {
			setEmailOpen(true);
			return;
		}
		if (/^org is already on plan/.test(result.message)) {
			toast.message("You're already on this plan.");
			if (orgId) void mutate(subscriptionKey(orgId));
			return;
		}
		billingErrorToast(result);
	}

	async function createCheckout(plan: PurchasablePlan) {
		const result = await startCheckout(plan);
		if (!result.ok) {
			handleCheckoutError(result);
			return;
		}
		try {
			sessionStorage.setItem(PENDING_PLAN_KEY, plan);
		} catch {}
		go(result.data.checkout_url);
	}

	function onUpgrade(plan: PurchasablePlan) {
		if (busy) return;
		if (!org?.billing_email) {
			setPendingPlan(plan);
			setEmailOpen(true);
			return;
		}
		void runAction(() => createCheckout(plan)).catch(() => {});
	}

	function onBillingEmailSubmit(email: string) {
		if (!orgId || busy) return;
		const plan = pendingPlan;
		void runAction(async () => {
			const result = await updateOrg(orgId, { billing_email: email });
			if (!result.ok) {
				toast.error("Couldn't save billing email.");
				return;
			}
			await mutate(orgKey(orgId));
			setEmailOpen(false);
			if (plan) await createCheckout(plan);
		}).catch(() => {});
	}

	function openPortalFlow() {
		if (busy) return;
		void runAction(async () => {
			const result = await openPortal();
			if (!result.ok) {
				if (result.message === BILLING_DETAIL.noCustomer) {
					toast.message("Choose a plan to get started.");
					return;
				}
				billingErrorToast(result);
				return;
			}
			go(result.data.portal_url);
		}).catch(() => {});
	}

	function confirmCancel() {
		if (!orgId || busy) return;
		void runAction(
			async () => {
				const result = await cancelSubscription();
				setCancelOpen(false);
				if (!result.ok) {
					if (
						result.message === BILLING_DETAIL.noActiveSubscription ||
						result.message === BILLING_DETAIL.alreadyCanceled
					) {
						toast.message("Your subscription is already inactive.");
						await mutate(subscriptionKey(orgId));
						return;
					}
					billingErrorToast(result);
					return;
				}
				const polled = await pollUntil({
					fn: () => getSubscription(),
					done: (s) => s.subscription_status === "canceled",
				});
				await mutate(
					subscriptionKey(orgId),
					polled.value ?? undefined,
					polled.value ? { revalidate: false } : undefined,
				);
				await mutate(usageKey(orgId));
			},
			{ toast: { success: "Subscription canceled" } },
		).catch(() => {});
	}

	const showSkeleton =
		!orgId || plansLoading || subLoading || (usageLoading && !usage);

	const periodLabel =
		usage?.period_start && usage?.period_end
			? `${formatDate(usage.period_start)} – ${formatDate(usage.period_end)}`
			: undefined;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
				<p className="text-sm text-muted-foreground">
					Manage your subscription plan and view usage.
				</p>
			</div>

			{showSkeleton ? (
				<BillingSkeleton />
			) : plansError && !plans ? (
				<DataFetchError
					message={plansError.message}
					onRetry={() => (orgId ? mutate(plansKey(orgId)) : Promise.resolve())}
				/>
			) : (
				<>
					{subscription?.subscription_status === "canceled" && (
						<Alert className="text-amber-700 dark:text-amber-500 [&>svg]:text-current">
							<IconClockExclamation />
							<AlertTitle>Your plan is ending</AlertTitle>
							<AlertDescription className="text-amber-700/90 dark:text-amber-500/90">
								{subscription.current_period_end
									? `Access continues until ${formatDate(subscription.current_period_end)}. Resume anytime before then.`
									: "Access continues until the end of the billing period. Resume anytime before then."}
							</AlertDescription>
						</Alert>
					)}

					{subError && !isMember ? (
						<DataFetchError
							message={subError.message}
							onRetry={() =>
								orgId ? mutate(subscriptionKey(orgId)) : Promise.resolve()
							}
						/>
					) : (
						<BillingStatusStrip
							subscription={isMember ? null : (subscription ?? null)}
							currentPlan={currentPlan}
							role={role}
							busy={busy}
							onManage={openPortalFlow}
							onCancel={() => setCancelOpen(true)}
							onResume={openPortalFlow}
						/>
					)}

					{plans && (
						<PlanCards
							plans={plans}
							currentPlan={currentPlan}
							subscription={isMember ? null : (subscription ?? null)}
							role={role}
							busy={busy}
							onUpgrade={onUpgrade}
							onManage={openPortalFlow}
						/>
					)}

					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-1">
							<h2 className="text-lg font-semibold tracking-tight">Usage</h2>
							<p className="text-sm text-muted-foreground">
								Your resource usage this billing period
								{periodLabel ? ` (${periodLabel})` : ""}.
							</p>
						</div>
						{usageError && !usage ? (
							<DataFetchError
								message={usageError.message}
								onRetry={() =>
									orgId ? mutate(usageKey(orgId)) : Promise.resolve()
								}
							/>
						) : usage ? (
							<div className="flex flex-col gap-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<UsageMeter
										label="Tokens ingested"
										used={usage.tokens.used}
										limit={usage.tokens.limit}
										periodStart={usage.period_start}
										periodEnd={usage.period_end}
									/>
									<UsageMeter
										label="Search queries"
										used={usage.queries.used}
										limit={usage.queries.limit}
										periodStart={usage.period_start}
										periodEnd={usage.period_end}
									/>
								</div>
								<SpacesMeter
									used={usage.spaces.used}
									limit={usage.spaces.limit}
								/>
							</div>
						) : null}
					</div>
				</>
			)}

			<CancelSubscriptionDialog
				open={cancelOpen}
				onOpenChange={setCancelOpen}
				currentPeriodEnd={subscription?.current_period_end ?? null}
				busy={busy}
				onConfirm={confirmCancel}
			/>
			<BillingEmailDialog
				open={emailOpen}
				onOpenChange={setEmailOpen}
				defaultEmail={org?.billing_email ?? user?.email ?? ""}
				busy={busy}
				onSubmit={onBillingEmailSubmit}
			/>
		</div>
	);
}
