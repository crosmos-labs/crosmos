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
import { useState } from "react";

export function CreateSpaceDialog({
	open,
	onOpenChange,
	onCreateSpace,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateSpace: (name: string, description?: string) => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	function handleClose() {
		setName("");
		setDescription("");
		onOpenChange(false);
	}

	function handleCreate() {
		if (!name.trim()) return;
		const spaceName = name.trim();
		const spaceDescription = description.trim() || undefined;
		setName("");
		setDescription("");
		onOpenChange(false);
		onCreateSpace(spaceName, spaceDescription);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Space</DialogTitle>
					<DialogDescription>
						Enter a name and optional description for your new memory space.
					</DialogDescription>
				</DialogHeader>
				<Input
					placeholder="e.g. Startup, School"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleCreate();
					}}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
				<textarea
					aria-label="Description"
					placeholder="Description (optional)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={2}
					className="flex min-h-15 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-input focus-visible:ring-0 resize-none"
				/>
				<DialogFooter>
					<Button variant="ghost" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleCreate} disabled={!name.trim()}>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
