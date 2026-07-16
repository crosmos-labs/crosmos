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
import { formatDistanceToNow } from "date-fns";
import {
	MEMORY_TYPE_BADGE_VARIANT,
	MEMORY_TYPE_ICONS,
	MEMORY_TYPE_LABELS,
} from "@/components/spaces/memory-list";
import type { Memory } from "@/lib/types/memory";

export function ForgetMemoryDialog({
	memory,
	onForget,
	onOpenChange,
}: {
	memory: Memory | null;
	onForget: (memoryUuid: string) => void;
	onOpenChange: (open: boolean) => void;
}) {
	const TypeIcon = memory ? MEMORY_TYPE_ICONS[memory.memory_type] : null;

	return (
		<AlertDialog open={!!memory} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Forget Memory</AlertDialogTitle>
					<AlertDialogDescription>
						This memory will be permanently forgotten. This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{memory && (
					<div className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 p-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Type</span>
							<Badge variant={MEMORY_TYPE_BADGE_VARIANT[memory.memory_type]}>
								{TypeIcon && <TypeIcon />}
								{MEMORY_TYPE_LABELS[memory.memory_type]}
							</Badge>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Created</span>
							<span className="text-foreground">
								{formatDistanceToNow(new Date(memory.created_at), {
									addSuffix: true,
								})}
							</span>
						</div>
						<div className="mt-1 line-clamp-3 text-muted-foreground whitespace-pre-wrap">
							{memory.content}
						</div>
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							if (memory) {
								onForget(memory.id);
								onOpenChange(false);
							}
						}}
					>
						Forget
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
