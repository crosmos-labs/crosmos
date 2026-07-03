export function StepBadge({ number }: { number: number }) {
	return (
		<span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium text-muted-foreground">
			{number}
		</span>
	);
}
