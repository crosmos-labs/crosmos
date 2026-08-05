export type UsageTone = "neutral" | "warn" | "over";

export function usageTone(fraction: number): UsageTone {
	if (fraction >= 0.9) return "over";
	if (fraction >= 0.7) return "warn";
	return "neutral";
}

export function usageTextClass(tone: UsageTone): string {
	return tone === "over"
		? "text-destructive"
		: tone === "warn"
			? "text-amber-500"
			: "text-muted-foreground";
}
