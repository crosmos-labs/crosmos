"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crosmos/ui/components/alert-dialog";
import { Badge } from "@crosmos/ui/components/badge";
import { Kbd } from "@crosmos/ui/components/kbd";
import { IconCornerDownLeft } from "@tabler/icons-react";
import {
	EXTRACTION_STATUS_BADGE_VARIANT,
	EXTRACTION_STATUS_LABELS,
} from "@/components/sources/source-list";
import type { ContentTypeStr, SourceSummary } from "@/lib/types/source";

const CONTENT_TYPE_LABELS: Record<ContentTypeStr, string> = {
	text: "Text",
	markdown: "Markdown",
	conversation: "Conversation",
	pdf: "PDF",
	image: "Image",
	audio: "Audio",
	video: "Video",
	html: "HTML",
	json: "JSON",
};

export function DeleteSourceDialog({
	source,
	onDelete,
	onOpenChange,
}: {
	source: SourceSummary | null;
	onDelete: (sourceUuid: string, spaceUuid: string) => void;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<AlertDialog open={!!source} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Source</AlertDialogTitle>
					<AlertDialogDescription>
						This source and all its associated data will be permanently deleted.
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{source && (
					<div className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 p-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Type</span>
							<Badge variant="outline">
								{CONTENT_TYPE_LABELS[source.content_type]}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Status</span>
							<Badge
								variant={
									EXTRACTION_STATUS_BADGE_VARIANT[source.extraction_status]
								}
							>
								{EXTRACTION_STATUS_LABELS[source.extraction_status]}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Tokens</span>
							<span className="text-foreground">
								{source.token_count.toLocaleString()}
							</span>
						</div>
						<div className="mt-1 line-clamp-3 text-muted-foreground whitespace-pre-wrap">
							{source.content_preview}
						</div>
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">
						Cancel <Kbd>Esc</Kbd>
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							if (source) {
								onDelete(source.id, source.space_id);
								onOpenChange(false);
							}
						}}
					>
						Delete{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
