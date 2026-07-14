"use client";

import { useState } from "react";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";
import { PaymentHistory } from "@/components/billing/payment-history";
import { SubscriptionPanel } from "@/components/billing/subscription-panel";
// TEMP: forced-state toggles, remove after testing.
import {
	type TempBillingState,
	TempBillingStates,
} from "@/components/billing/temp-billing-states";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { RestrictedState } from "@/components/shared/restricted-state";
import { usePortalReturnSync, useSubscription } from "@/hooks/use-billing";
import { useOrgRole } from "@/hooks/use-org-role";

export default function BillingPage() {
	const { user, orgId, role, isOwnerAdmin } = useOrgRole();

	usePortalReturnSync();

	const {
		data: subscription,
		isLoading: subLoading,
		error: subError,
		mutate: reloadSubscription,
	} = useSubscription();

	// TEMP: forced-state overrides, remove after testing (grep "TEMP").
	const [temp, setTemp] = useState<TempBillingState>({});
	const canManageBilling = temp.role ? temp.role !== "member" : isOwnerAdmin;
	const canManage = temp.role ? temp.role === "owner" : role === "owner";
	const shownSubscription = temp.subscription ?? subscription;

	// Only surface an error when its data is missing: a failed background
	// revalidation keeps the rendered page instead of tearing it down.
	const error =
		temp.view === "error"
			? new Error("Forced error state (temp)")
			: !shownSubscription
				? subError
				: undefined;

	const loading =
		temp.view === "skeleton" ||
		!user ||
		!orgId ||
		(subLoading && !shownSubscription);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
				<p className="text-sm text-muted-foreground">
					Manage your subscription plan and payment history.
				</p>
			</div>
			{/* TEMP: remove after testing. */}
			<TempBillingStates value={temp} onChange={setTemp} />
			{user && !canManageBilling ? (
				<RestrictedState
					title="Billing is restricted"
					description="Only organization owners and admins can manage billing."
				/>
			) : error ? (
				<DataFetchError
					message={error.message}
					onRetry={() => reloadSubscription()}
				/>
			) : loading ? (
				<BillingSkeleton />
			) : shownSubscription ? (
				<>
					<SubscriptionPanel
						subscription={shownSubscription}
						canManage={canManage}
					/>
					<PaymentHistory tempData={temp.payments} />
				</>
			) : null}
		</div>
	);
}
