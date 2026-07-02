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
import { Spinner } from "@crosmos/ui/components/spinner";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { updateOrg } from "@/actions/orgs";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { orgKey } from "@/hooks/use-org";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BillingEmailDialog({
	open,
	onOpenChange,
	onSaved,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const { runAction } = useActionLoader();
	const { mutate } = useSWRConfig();
	const [email, setEmail] = useState(user?.email ?? "");
	const [saving, setSaving] = useState(false);

	const trimmed = email.trim();
	const valid = EMAIL_RE.test(trimmed);

	async function handleSave() {
		if (!orgId || !valid || saving) return;
		setSaving(true);
		try {
			await runAction(
				async () => {
					const res = await updateOrg(orgId, { billing_email: trimmed });
					if (!res.ok) throw new Error(res.message);
					await mutate(orgKey(orgId));
				},
				{ toast: { success: "Billing email saved" } },
			);
			onOpenChange(false);
			onSaved();
		} catch {
			toast.error("Couldn't save billing email");
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a billing email</DialogTitle>
					<DialogDescription>
						Polar sends your invoices and receipts here. It's required before
						checkout.
					</DialogDescription>
				</DialogHeader>
				<Input
					type="email"
					placeholder="billing@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSave();
					}}
					className="focus-visible:border-input focus-visible:ring-0"
				/>
				<DialogFooter>
					<Button
						variant="ghost"
						disabled={saving}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={!valid || saving}>
						{saving && <Spinner data-icon="inline-start" />}
						Save & continue
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
