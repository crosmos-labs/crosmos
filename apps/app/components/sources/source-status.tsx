import { cn } from "@crosmos/ui/lib/utils";
import { EXTRACTION_STATUS_LABELS } from "@/lib/source-labels";
import type { ExtractionStatus } from "@/lib/types/source";

const DOT_CLASSES: Record<ExtractionStatus, string> = {
	pending: "border border-muted-foreground/40",
	processing: "bg-amber-500 animate-pulse",
	completed: "bg-green-500",
	failed: "bg-destructive",
};

export function SourceStatusDot({
	status,
	className,
}: {
	status: ExtractionStatus;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"size-2 shrink-0 rounded-full",
				DOT_CLASSES[status],
				className,
			)}
		/>
	);
}

const PILL_CLASSES: Record<ExtractionStatus, string> = {
	pending: "bg-muted text-muted-foreground",
	processing: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
	completed: "bg-green-500/10 text-green-600 dark:text-green-500",
	failed: "bg-destructive/10 text-destructive",
};

export function SourceStatusPill({
	status,
	className,
}: {
	status: ExtractionStatus;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
				PILL_CLASSES[status],
				className,
			)}
		>
			{status === "processing" && (
				<span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
			)}
			{EXTRACTION_STATUS_LABELS[status]}
		</span>
	);
}

export function SourceStatus({
	status,
	className,
}: {
	status: ExtractionStatus;
	className?: string;
}) {
	return (
		<span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
			<SourceStatusDot status={status} />
			<span
				className={cn(
					"text-muted-foreground",
					status === "failed" && "text-destructive",
				)}
			>
				{EXTRACTION_STATUS_LABELS[status]}
			</span>
		</span>
	);
}
