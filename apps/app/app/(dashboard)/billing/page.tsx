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
import { useSWRConfig } from "swr";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";
import { SpacesMeter } from "@/components/billing/spaces-meter";
import { UsageMeter } from "@/components/billing/usage-meter";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { usageKey, useUsage } from "@/hooks/use-usage";
import { formatNumber } from "@/lib/format";

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function BillingPage() {
	const { mutate } = useSWRConfig();
	const orgId = useActiveOrgId();
	const { data, isLoading, error } = useUsage();
	const swrKey = orgId ? usageKey(orgId) : null;

	const plan = data?.plan ?? "free";
	const periodStart = data?.period_start;
	const periodEnd = data?.period_end;
	const periodLabel =
		periodStart && periodEnd
			? `${formatDate(periodStart)} – ${formatDate(periodEnd)}`
			: undefined;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
				<p className="text-sm text-muted-foreground">
					Manage your subscription plan and view usage.
				</p>
			</div>
			{error ? (
				<DataFetchError
					message={error.message}
					onRetry={() => (swrKey ? mutate(swrKey) : Promise.resolve())}
				/>
			) : !orgId || (isLoading && !data) ? (
				<BillingSkeleton />
			) : (
				<>
					<ItemGroup>
						<Item
							variant="outline"
							className="hover:bg-muted/50 transition-colors hover:transition-none px-4 py-3.5"
						>
							<ItemContent>
								<ItemTitle className="flex items-center gap-2 text-base">
									{capitalize(plan)} Plan
									<Badge variant="secondary">{capitalize(plan)}</Badge>
								</ItemTitle>
								<ItemDescription>
									{data
										? `Up to ${formatNumber(data.tokens.limit)} tokens and ${formatNumber(data.queries.limit)} queries per month. Upgrade for higher limits and premium features.`
										: "Upgrade for higher limits and premium features."}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button disabled>Upgrade</Button>
							</ItemActions>
						</Item>
					</ItemGroup>
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-1">
							<h2 className="text-lg font-semibold tracking-tight">Usage</h2>
							<p className="text-sm text-muted-foreground">
								Your resource usage this billing period
								{periodLabel ? ` (${periodLabel})` : ""}.
							</p>
						</div>
						{data && (
							<div className="flex flex-col gap-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<UsageMeter
										label="Tokens ingested"
										used={data.tokens.used}
										limit={data.tokens.limit}
										periodStart={data.period_start}
										periodEnd={data.period_end}
									/>
									<UsageMeter
										label="Search queries"
										used={data.queries.used}
										limit={data.queries.limit}
										periodStart={data.period_start}
										periodEnd={data.period_end}
									/>
								</div>
								<SpacesMeter
									used={data.spaces.used}
									limit={data.spaces.limit}
								/>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
