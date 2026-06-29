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
import { IconCornerDownLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BillingEmailDialog({
	open,
	onOpenChange,
	defaultEmail,
	busy,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultEmail: string;
	busy: boolean;
	onSubmit: (email: string) => void;
}) {
	const [email, setEmail] = useState(defaultEmail);

	useEffect(() => {
		if (open) setEmail(defaultEmail);
	}, [open, defaultEmail]);

	const valid = EMAIL_RE.test(email.trim());

	function handleSubmit() {
		if (!valid || busy) return;
		onSubmit(email.trim());
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a billing email</DialogTitle>
					<DialogDescription>
						Invoices and receipts are sent here. Required before checkout.
					</DialogDescription>
				</DialogHeader>
				<Input
					type="email"
					placeholder="billing@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSubmit();
					}}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
				<DialogFooter>
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={busy}
					>
						Cancel <Kbd>Esc</Kbd>
					</Button>
					<Button onClick={handleSubmit} disabled={!valid || busy}>
						Continue{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
