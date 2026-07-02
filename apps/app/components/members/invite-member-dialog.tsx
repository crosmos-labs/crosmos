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
import type { CreateInviteRequest } from "@/lib/types/org";
import { isValidEmail } from "@/lib/validate";

export function InviteMemberDialog({
	open,
	onOpenChange,
	onInvite,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onInvite: (email: string, role: CreateInviteRequest["role"]) => void;
}) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<CreateInviteRequest["role"]>("member");

	const canSubmit = isValidEmail(email.trim());

	function handleClose() {
		setEmail("");
		setRole("member");
		onOpenChange(false);
	}

	function handleInvite() {
		const value = email.trim();
		setEmail("");
		setRole("member");
		onOpenChange(false);
		onInvite(value, role);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite member</DialogTitle>
					<DialogDescription>
						Send an invitation by email. They'll join your organization once
						they accept.
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center gap-2">
					<Input
						type="email"
						placeholder="name@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleInvite();
						}}
						className="flex-1 focus-visible:border-input focus-visible:ring-0"
					/>
					<Select
						value={role}
						onValueChange={(v) => setRole(v as CreateInviteRequest["role"])}
					>
						<SelectTrigger className="w-28">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="member">Member</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={handleClose}>
						Cancel <Kbd>Esc</Kbd>
					</Button>
					<Button onClick={handleInvite} disabled={!canSubmit}>
						Send invite{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
