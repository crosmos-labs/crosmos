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
import { IconCoins } from "@tabler/icons-react";
import { SourceStatusPill } from "@/components/sources/source-status";
import { contentTypeLabel } from "@/lib/source-labels";
import type { SourceSummary } from "@/lib/types/source";

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
								{contentTypeLabel(source.content_type)}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Status</span>
							<SourceStatusPill status={source.extraction_status} />
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Tokens</span>
							<Badge variant="secondary">
								<IconCoins />
								{source.token_count.toLocaleString()}
							</Badge>
						</div>
						<div className="mt-1 line-clamp-3 text-muted-foreground whitespace-pre-wrap">
							{source.content_preview}
						</div>
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							if (source) {
								onDelete(source.id, source.space_id);
								onOpenChange(false);
							}
						}}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
