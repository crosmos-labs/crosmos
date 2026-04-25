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

function formatNumber(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
	return n.toLocaleString();
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
						[ {percentage}					% ]
					</span>
				</div>
			</div>
			<Progress value={percentage} className="mt-2 h-2" />
		</div>
	);
}

export default function BillingPage() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
				<p className="text-sm text-muted-foreground">
					Manage your subscription plan and view usage.
				</p>
			</div>
			<ItemGroup>
				<Item
					variant="outline"
					className="hover:bg-muted/50 transition-colors hover:transition-none px-4 py-3.5"
				>
					<ItemContent>
						<ItemTitle className="flex items-center gap-2 text-base">
							Basic Plan
							<Badge variant="secondary">Free</Badge>
						</ItemTitle>
						<ItemDescription>
							Up to 500K tokens and 5K queries per month. Upgrade for
							higher limits and premium features.
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
						Your resource usage this billing period.
					</p>
				</div>
				<div className="flex flex-col gap-6">
					<UsageRow
					label="Tokens Ingested"
					used={65000}
					limit={500000}
				/>
					<UsageRow
					label="Search Queries"
					used={720}
					limit={5000}
				/>
				</div>
			</div>
		</div>
	);
}
