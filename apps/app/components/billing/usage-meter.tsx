"use client";

import { Card } from "@crosmos/ui/components/card";
import type { ChartConfig } from "@crosmos/ui/components/dither-kit/chart-context";
import { Pie } from "@crosmos/ui/components/dither-kit/pie";
import { PieChart } from "@crosmos/ui/components/dither-kit/pie-chart";
import { Tooltip } from "@crosmos/ui/components/dither-kit/tooltip";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import { useMemo } from "react";
import { formatNumber } from "@/lib/format";
import {
	type UsageTone,
	usageTextClass,
	usageTone,
} from "@/lib/usage-progress";

type Pace = { text: string; tone: UsageTone; predictedFraction: number | null };

function computePace(
	used: number,
	limit: number,
	startISO: string,
	endISO: string,
): Pace {
	const start = Date.parse(startISO);
	const total = Date.parse(endISO) - start;
	if (!Number.isFinite(total) || total <= 0 || limit <= 0) {
		return { text: "Tracking usage", tone: "neutral", predictedFraction: null };
	}

	const elapsed = Math.min(Math.max(Date.now() - start, 0), total);
	if (used - limit >= 0) {
		return { text: "", tone: "over", predictedFraction: null };
	}

	const periodFraction = elapsed / total;
	if (periodFraction < 0.1 || used === 0) {
		return { text: "Tracking usage", tone: "neutral", predictedFraction: null };
	}

	const projected = used / periodFraction;
	const text = `Predicted usage ~${formatNumber(Math.round(projected))}`;
	if (projected <= limit) {
		return { text, tone: "neutral", predictedFraction: projected / limit };
	}

	const daysLeft = Math.ceil((limit - used) / (used / elapsed) / 86_400_000);
	return {
		text: `${text} · limit in ~${daysLeft}d`,
		tone: "warn",
		predictedFraction: 1,
	};
}

const ZERO_MARGINS = { top: 0, right: 0, bottom: 0, left: 0 };

export function UsageMeterSkeleton() {
	return (
		<Card className="gap-3 p-4">
			<Skeleton className="h-4 w-24" />
			<Skeleton className="mx-auto size-[120px] rounded-full" />
			<div className="flex flex-col items-center gap-1">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-3 w-32" />
			</div>
		</Card>
	);
}

export function UsageMeter({
	label,
	used,
	limit,
	periodStart,
	periodEnd,
	color = "blue",
}: {
	label: string;
	used: number;
	limit: number;
	periodStart: string;
	periodEnd: string;
	color?: "blue" | "purple";
}) {
	const unlimited = limit === -1;
	const fraction = limit > 0 ? Math.min(used / limit, 1) : 0;
	const percentage = Math.round(fraction * 100);
	const pace = computePace(used, limit, periodStart, periodEnd);
	const tone = usageTone(fraction);
	const usedColor =
		tone === "over" ? "red" : tone === "warn" ? "orange" : color;
	const remaining = Math.max(limit - used, 0);

	// Memoized because the chart replays its entrance sweep whenever the data
	// array identity changes (useRevision), e.g. on every SWR revalidation.
	const rows = useMemo(
		() =>
			unlimited || used + remaining <= 0
				? [{ name: "remaining", value: 1 }]
				: [
						{ name: "used", value: used },
						{ name: "remaining", value: remaining },
					],
		[unlimited, used, remaining],
	);
	const config = useMemo(
		() =>
			({
				used: { label, color: usedColor },
				remaining: { label: "Remaining", color: "grey" },
			}) satisfies ChartConfig,
		[label, usedColor],
	);

	return (
		<Card className="gap-3 p-4">
			<span className="text-sm font-medium">{label}</span>
			<div className="relative mx-auto size-[120px]">
				<PieChart
					data={rows}
					config={config}
					dataKey="value"
					nameKey="name"
					innerRadius={0.7}
					margins={ZERO_MARGINS}
				>
					<Pie variant="gradient" />
					{!unlimited && (
						<Tooltip valueFormatter={(value) => formatNumber(value)} />
					)}
				</PieChart>
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<span className="text-lg font-semibold tabular-nums">
						{unlimited ? "∞" : `${percentage}%`}
					</span>
				</div>
			</div>
			<div className="flex flex-col items-center gap-1 text-center">
				<div className="font-mono text-sm">
					<span>{formatNumber(used)}</span>
					<span className="text-muted-foreground">
						{" "}
						/ {unlimited ? "Unlimited" : formatNumber(limit)}
					</span>
				</div>
				{pace.text && (
					<span className={cn("text-xs", usageTextClass(pace.tone))}>
						{pace.text}
					</span>
				)}
			</div>
		</Card>
	);
}
