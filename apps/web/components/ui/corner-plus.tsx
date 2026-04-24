import { cn } from "@crosmos/ui/lib/utils";

export function CornerPlus({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute z-10 size-5 shrink-0 stroke-muted-foreground stroke-2",
				className,
			)}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</svg>
	);
}
