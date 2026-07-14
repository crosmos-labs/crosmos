"use client";

import { BillingSkeleton } from "@/components/billing/billing-skeleton";
import { PaymentHistory } from "@/components/billing/payment-history";
import { SubscriptionPanel } from "@/components/billing/subscription-panel";
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

	// Only surface an error when its data is missing: a failed background
	// revalidation keeps the rendered page instead of tearing it down.
	const error = !subscription ? subError : undefined;

	const loading = !user || !orgId || (subLoading && !subscription);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
				<p className="text-sm text-muted-foreground">
					Manage your subscription plan and payment history.
				</p>
			</div>
			{user && !isOwnerAdmin ? (
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
			) : subscription ? (
				<>
					<SubscriptionPanel
						subscription={subscription}
						canManage={role === "owner"}
					/>
					<PaymentHistory />
				</>
			) : null}
		</div>
	);
}
