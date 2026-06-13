"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { formatNumber } from "@/lib/format";

type Tone = "neutral" | "warn" | "over";
type Pace = { text: string; tone: Tone; predictedFraction: number | null };

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

function usageTone(fraction: number): Tone {
	if (fraction >= 0.9) return "over";

	if (fraction >= 0.7) return "warn";

	return "neutral";
}

function barClass(tone: Tone): string {
	return tone === "over"
		? "bg-destructive"
		: tone === "warn"
			? "bg-amber-500"
			: "bg-primary";
}

function textClass(tone: Tone): string {
	return tone === "over"
		? "text-destructive"
		: tone === "warn"
			? "text-amber-500"
			: "text-muted-foreground";
}

export function UsageMeter({
	label,
	used,
	limit,
	periodStart,
	periodEnd,
}: {
	label: string;
	used: number;
	limit: number;
	periodStart: string;
	periodEnd: string;
}) {
	const fraction = limit > 0 ? Math.min(used / limit, 1) : 0;
	const percentage = Math.round(fraction * 100);
	const pace = computePace(used, limit, periodStart, periodEnd);
	const actualTone = usageTone(fraction);

	return (
		<div className="flex flex-col gap-2 rounded-lg border p-4">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">{label}</span>
					<span className="text-sm text-muted-foreground">{percentage}%</span>
				</div>
				{pace.text && (
					<span className={cn("text-xs", textClass(pace.tone))}>
						{pace.text}
					</span>
				)}
			</div>
			<div className="mt-auto flex flex-col gap-3">
				<div className="font-mono text-sm">
					<span>{formatNumber(used)}</span>
					<span className="text-muted-foreground">
						{" "}
						/ {formatNumber(limit)}
					</span>
				</div>
				<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
					{pace.predictedFraction !== null && (
						<div
							className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/10"
							style={{ width: `${pace.predictedFraction * 100}%` }}
						/>
					)}
					<div
						className={cn(
							"absolute inset-y-0 left-0 rounded-full",
							barClass(actualTone),
						)}
						style={{ width: `${fraction * 100}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
