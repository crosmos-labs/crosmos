"use client";

import { Button } from "@crosmos/ui/components/button";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import Link from "next/link";
import { UsageSkeleton } from "@/components/billing/billing-skeleton";
import { UsageMeter } from "@/components/billing/usage-meter";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useOrgRole } from "@/hooks/use-org-role";
import { useUsage } from "@/hooks/use-usage";
import { capitalize, formatDate, formatNumber } from "@/lib/format";

const ratePillClasses =
	"inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground";

export default function UsagePage() {
	const { user, orgId, isOwnerAdmin } = useOrgRole();
	const { data: usage, isLoading, error, mutate: reloadUsage } = useUsage();

	const periodLabel =
		usage?.period_start && usage?.period_end
			? `${formatDate(usage.period_start)} – ${formatDate(usage.period_end)}`
			: undefined;

	const loading = !user || !orgId || (isLoading && !usage);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-start justify-between gap-3">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
					<p className="text-sm text-muted-foreground">
						Your resource usage this billing period
						{periodLabel ? ` (${periodLabel})` : ""}.
					</p>
				</div>
				{usage ? (
					<div className="flex flex-wrap items-center justify-end gap-2">
						<span className={ratePillClasses}>
							{usage.rate_limit_rpm} requests/min
						</span>
						<span className={ratePillClasses}>
							{formatNumber(usage.rate_limit_per_day)} requests/day
						</span>
						{isOwnerAdmin ? (
							<Button variant="outline" size="sm" asChild>
								<Link href="/billing">{capitalize(usage.plan)} plan</Link>
							</Button>
						) : (
							<span className="text-sm text-muted-foreground">
								{capitalize(usage.plan)} plan
							</span>
						)}
					</div>
				) : loading ? (
					<div
						aria-busy="true"
						className="flex flex-wrap items-center justify-end gap-2"
					>
						<Skeleton className="h-5 w-28 rounded-full" />
						<Skeleton className="h-5 w-28 rounded-full" />
						<Skeleton className="h-7 w-24 rounded-lg" />
					</div>
				) : null}
			</div>
			{error && !usage ? (
				<DataFetchError message={error.message} onRetry={() => reloadUsage()} />
			) : loading ? (
				<UsageSkeleton />
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
							color="purple"
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}
