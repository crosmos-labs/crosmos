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
