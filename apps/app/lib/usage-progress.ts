export type UsageTone = "neutral" | "warn" | "over";

export function usageTone(fraction: number): UsageTone {
	if (fraction >= 0.9) return "over";
	if (fraction >= 0.7) return "warn";
	return "neutral";
}

export function usageBarClass(tone: UsageTone): string {
	return tone === "over"
		? "bg-destructive"
		: tone === "warn"
			? "bg-amber-500"
			: "bg-primary";
}

export function usageProgressClass(tone: UsageTone): string {
	return tone === "over"
		? "[&_[data-slot=progress-indicator]]:bg-destructive"
		: tone === "warn"
			? "[&_[data-slot=progress-indicator]]:bg-amber-500"
			: "[&_[data-slot=progress-indicator]]:bg-primary";
}

export function usageTextClass(tone: UsageTone): string {
	return tone === "over"
		? "text-destructive"
		: tone === "warn"
			? "text-amber-500"
			: "text-muted-foreground";
}
