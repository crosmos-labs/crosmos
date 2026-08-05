"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crosmos/ui/components/dialog";
import { Input } from "@crosmos/ui/components/input";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import type { Space } from "@/lib/types/space";

export function DeleteSpaceDialog({
	space,
	onDelete,
	onOpenChange,
}: {
	space: Space | null;
	onDelete: (spaceId: string) => void;
	onOpenChange: (open: boolean) => void;
}) {
	const [confirmName, setConfirmName] = useState("");
	const canDelete = space !== null && confirmName === space.name;

	function handleClose() {
		setConfirmName("");
		onOpenChange(false);
	}

	function handleDelete() {
		if (!space || !canDelete) return;
		setConfirmName("");
		onOpenChange(false);
		onDelete(space.id);
	}

	return (
		<Dialog open={!!space} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Space</DialogTitle>
					<DialogDescription asChild>
						<div className="flex flex-col gap-3 text-left">
							<span>
								This will permanently delete this space and all its{" "}
								<strong>memories</strong>, <strong>entities</strong>, and{" "}
								<strong>sources</strong>. This action cannot be undone.
							</span>
							<div className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 p-3 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Name</span>
									<span className="font-medium text-foreground">
										{space?.name}
									</span>
								</div>
								{space?.description && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Description</span>
										<span className="text-foreground">{space.description}</span>
									</div>
								)}
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Created</span>
									<span className="text-foreground">
										{space
											? formatDistanceToNow(new Date(space.created_at), {
													addSuffix: true,
												})
											: ""}
									</span>
								</div>
							</div>
							<span>
								Type <strong>{space?.name}</strong> to confirm.
							</span>
						</div>
					</DialogDescription>
				</DialogHeader>
				<Input
					placeholder={space?.name}
					value={confirmName}
					onChange={(e) => setConfirmName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleDelete();
					}}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
				<DialogFooter>
					<Button variant="ghost" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={!canDelete}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
