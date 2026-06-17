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
import { Kbd } from "@crosmos/ui/components/kbd";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import { IconCornerDownLeft } from "@tabler/icons-react";
import { useState } from "react";

export function CreateKeyDialog({
	open,
	onOpenChange,
	onCreateKey,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateKey: (name: string, expiresInDays?: number) => void;
}) {
	const [name, setName] = useState("");
	const [expiry, setExpiry] = useState("0");

	function handleClose() {
		setName("");
		setExpiry("0");
		onOpenChange(false);
	}

	function handleCreate() {
		if (!name.trim()) return;
		const keyName = name.trim();
		const days = Number(expiry) || 0;
		setName("");
		setExpiry("0");
		onOpenChange(false);
		onCreateKey(keyName, days > 0 ? days : undefined);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create API Key</DialogTitle>
					<DialogDescription>
						Enter a name and expiry for your new API key.
					</DialogDescription>
				</DialogHeader>
				<Input
					placeholder="e.g. production-key"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleCreate();
					}}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">Expires in</span>
					<Select value={expiry} onValueChange={setExpiry}>
						<SelectTrigger
							aria-label="Expires in"
							className="focus-visible:ring-0 focus-visible:border-input"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="0">Never</SelectItem>
							<SelectItem value="30">30 days</SelectItem>
							<SelectItem value="60">60 days</SelectItem>
							<SelectItem value="90">90 days</SelectItem>
							<SelectItem value="365">1 year</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={handleClose}>
						Cancel <Kbd>Esc</Kbd>
					</Button>
					<Button onClick={handleCreate} disabled={!name.trim()}>
						Create{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
