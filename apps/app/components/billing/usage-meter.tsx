"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { formatNumber } from "@/lib/format";

type Tone = "neutral" | "warn" | "over";

function computePace(
	used: number,
	limit: number,
	startISO: string,
	endISO: string,
): { text: string; tone: Tone; predictedFraction: number | null } {
	const pct = limit > 0 ? used / limit : 0;
	const baseTone: Tone = pct >= 0.9 ? "over" : pct >= 0.75 ? "warn" : "neutral";

	const start = Date.parse(startISO);
	const end = Date.parse(endISO);
	const total = end - start;
	if (!Number.isFinite(total) || total <= 0 || limit <= 0) {
		return { text: "Tracking usage", tone: baseTone, predictedFraction: null };
	}

	const elapsed = Math.min(Math.max(Date.now() - start, 0), total);
	const fraction = elapsed / total;
	if (fraction < 0.1 || used === 0) {
		return { text: "Tracking usage", tone: baseTone, predictedFraction: null };
	}

	const projected = used / fraction;
	const predictedFraction = Math.min(projected / limit, 1);
	const text = `Predicted usage ~${formatNumber(Math.round(projected))}`;
	if (projected > limit) {
		const perMs = used / elapsed;
		const daysLeft = Math.max(
			0,
			Math.round((limit - used) / perMs / 86_400_000),
		);
		return {
			text: `${text} · limit in ~${daysLeft}d`,
			tone: "over",
			predictedFraction,
		};
	}
	return { text, tone: baseTone, predictedFraction };
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

	return (
		<div className="flex flex-col gap-2 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">{label}</span>
				<span className="text-sm text-muted-foreground">{percentage}%</span>
			</div>
			<div className="font-mono text-sm">
				<span>{formatNumber(used)}</span>
				<span className="text-muted-foreground"> / {formatNumber(limit)}</span>
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
						barClass(pace.tone),
					)}
					style={{ width: `${fraction * 100}%` }}
				/>
			</div>
			{pace.text && (
				<span className={cn("text-xs", textClass(pace.tone))}>{pace.text}</span>
			)}
		</div>
	);
}
