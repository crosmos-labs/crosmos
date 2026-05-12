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
import { Progress } from "@crosmos/ui/components/progress";
import { useSWRConfig } from "swr";
import { BillingSkeleton } from "@/components/billing-skeleton";
import { DataFetchError } from "@/components/data-fetch-error";
import { useUsage } from "@/hooks/use-usage";

function formatNumber(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
	return n.toLocaleString();
}

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

function UsageRow({
	label,
	used,
	limit,
	description,
}: {
	label: string;
	used: number;
	limit: number;
	description?: string;
}) {
	const percentage = Math.min(Math.round((used / limit) * 100), 100);

	return (
		<div>
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-0.5">
					<span className="text-sm font-medium">{label}</span>
					{description && (
						<span className="text-xs text-muted-foreground">{description}</span>
					)}
				</div>
				<div className="flex items-center gap-3 font-mono">
					<span className="text-sm text-foreground">
						{formatNumber(used)} / {formatNumber(limit)}
					</span>
					<span className="text-sm text-muted-foreground">
						[ {percentage} % ]
					</span>
				</div>
			</div>
			<Progress value={percentage} className="mt-2 h-2" />
		</div>
	);
}

export default function BillingPage() {
	const { mutate } = useSWRConfig();
	const { data, isLoading, error } = useUsage();

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
					onRetry={() => mutate("/usage")}
				/>
			) : isLoading && !data ? (
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
						<div className="flex flex-col gap-6">
							{data && (
								<>
									<UsageRow
										label="Tokens Ingested"
										used={data.tokens.used}
										limit={data.tokens.limit}
									/>
									<UsageRow
										label="Search Queries"
										used={data.queries.used}
										limit={data.queries.limit}
									/>
									<UsageRow
										label="Spaces"
										used={data.spaces.used}
										limit={data.spaces.limit}
									/>
								</>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
