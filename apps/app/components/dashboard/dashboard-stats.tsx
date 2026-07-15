"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crosmos/ui/components/card";
import { DitherGradient } from "@crosmos/ui/components/dither-kit/gradient";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import {
	IconArrowRight,
	IconCreditCard,
	IconDatabase,
	IconKey,
	IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useSpaces } from "@/hooks/use-spaces";
import { useUsage } from "@/hooks/use-usage";
import { usageTone } from "@/lib/usage-progress";

function formatNumber(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
	return n.toLocaleString();
}

function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
	href,
	progress,
}: {
	title: string;
	value: string;
	subtitle?: string;
	icon: React.ComponentType<{ className?: string }>;
	href: string;
	progress?: number;
}) {
	const tone = usageTone((progress ?? 0) / 100);
	const fill = tone === "over" ? "red" : tone === "warn" ? "orange" : "green";
	return (
		<Link href={href} className="group">
			<Card className="gap-0 transition-colors h-full">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
						{title}
						<IconArrowRight
							size={14}
							className="text-muted-foreground transition-colors group-hover:text-foreground"
						/>
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Icon className="size-4 text-muted-foreground" />
						<span className="text-2xl font-semibold tracking-tight">
							{value}
						</span>
					</div>
					<span className="text-xs text-muted-foreground h-4">
						{subtitle ?? "\u00A0"}
					</span>
					{progress !== undefined && (
						<div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="absolute inset-y-0 left-0 overflow-hidden"
								style={{ width: `${progress}%` }}
							>
								<DitherGradient
									from={fill}
									direction="right"
									cell={2}
									className="absolute inset-0"
								/>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}

function StatCardSkeleton() {
	return (
		<Card className="gap-0">
			<CardHeader className="pb-2">
				<Skeleton className="h-4 w-20" />
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<Skeleton className="h-7 w-16" />
			</CardContent>
		</Card>
	);
}

export function DashboardStats() {
	const { data: spaces, isLoading: spacesLoading } = useSpaces();
	const { data: apiKeys, isLoading: keysLoading } = useApiKeys();
	const { data: usage, isLoading: usageLoading } = useUsage();

	const isLoading = spacesLoading || keysLoading || usageLoading;

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{["spaces", "keys", "tokens", "queries"].map((k) => (
					<StatCardSkeleton key={k} />
				))}
			</div>
		);
	}

	const spaceCount = spaces?.length ?? 0;
	const spacesLimit = usage?.spaces.limit ?? -1;
	const activeKeys = apiKeys?.filter((k) => k.is_active).length ?? 0;
	const tokensUsed = usage?.tokens.used ?? 0;
	const tokensLimit = usage?.tokens.limit ?? 1;
	const queriesUsed = usage?.queries.used ?? 0;
	const queriesLimit = usage?.queries.limit ?? 1;
	const tokensPercent = Math.min(
		Math.round((tokensUsed / tokensLimit) * 100),
		100,
	);
	const queriesPercent = Math.min(
		Math.round((queriesUsed / queriesLimit) * 100),
		100,
	);

	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			<StatCard
				title="Spaces"
				value={
					spacesLimit > 0
						? `${spaceCount} / ${spacesLimit}`
						: String(spaceCount)
				}
				icon={IconDatabase}
				href="/spaces"
			/>
			<StatCard
				title="API Keys"
				value={String(activeKeys)}
				subtitle={
					activeKeys === 1 ? "1 active key" : `${activeKeys} active keys`
				}
				icon={IconKey}
				href="/api-key"
			/>
			<StatCard
				title="Tokens"
				value={formatNumber(tokensUsed)}
				subtitle={`${formatNumber(tokensUsed)} / ${formatNumber(tokensLimit)}`}
				icon={IconSearch}
				href="/usage"
				progress={tokensPercent}
			/>
			<StatCard
				title="Requests"
				value={formatNumber(queriesUsed)}
				subtitle={`${formatNumber(queriesUsed)} / ${formatNumber(queriesLimit)}`}
				icon={IconCreditCard}
				href="/usage"
				progress={queriesPercent}
			/>
		</div>
	);
}
