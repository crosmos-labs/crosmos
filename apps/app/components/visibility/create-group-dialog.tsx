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
import { Label } from "@crosmos/ui/components/label";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { createGroup } from "@/actions/visibility";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { visibilityGroupsKey } from "@/hooks/use-visibility";
import { optimisticInsert } from "@/lib/optimistic";
import type { VisibilityGroup } from "@/lib/types/visibility";
import { unwrapAction } from "@/lib/unwrap-action";

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export function CreateGroupDialog({
	orgId,
	open,
	onOpenChange,
	disabled = false,
}: {
	orgId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	disabled?: boolean;
}) {
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [error, setError] = useState<string | null>(null);

	const trimmedName = name.trim();
	const trimmedSlug = slug.trim();
	const slugValid = trimmedSlug === "" || SLUG_RE.test(trimmedSlug);
	const actionBusy = activeCount > 0;
	const canCreate = trimmedName !== "" && slugValid && !disabled && !actionBusy;

	function reset() {
		setName("");
		setSlug("");
		setError(null);
	}

	function handleClose() {
		reset();
		onOpenChange(false);
	}

	function handleCreate() {
		if (!canCreate) return;
		setError(null);
		const name = trimmedName;
		const slug =
			trimmedSlug ||
			name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");
		const now = new Date().toISOString();
		const tempGroup: VisibilityGroup = {
			id: `optimistic-${Date.now()}`,
			name,
			slug,
			member_count: 0,
			created_at: now,
			updated_at: now,
		};
		reset();
		onOpenChange(false);
		runAction(
			() =>
				optimisticInsert(
					mutate,
					visibilityGroupsKey(orgId),
					tempGroup,
					async () =>
						unwrapAction(
							await createGroup(orgId, name, trimmedSlug || undefined),
						),
				),
			{ toast: { success: "Group created" } },
		).catch((err: unknown) => {
			const code =
				err && typeof err === "object" && "code" in err
					? (err as { code: unknown }).code
					: null;
			if (code === "slug_taken") {
				toast.error("That slug is already taken.");
				return;
			}
			toast.error(err instanceof Error ? err.message : "Couldn't create group");
		});
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New group</DialogTitle>
					<DialogDescription>
						Groups bucket users together so access rules can reference them.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-2">
					<Label htmlFor="group-name">Name</Label>
					<Input
						id="group-name"
						placeholder="e.g. Engineering"
						value={name}
						disabled={disabled || actionBusy}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleCreate();
						}}
						className="focus-visible:border-input focus-visible:ring-0"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Label htmlFor="group-slug">Slug (optional)</Label>
					<Input
						id="group-slug"
						placeholder="engineering"
						value={slug}
						disabled={disabled || actionBusy}
						onChange={(e) => {
							setSlug(e.target.value);
							setError(null);
						}}
						aria-invalid={!slugValid || error !== null}
						className="focus-visible:border-input focus-visible:ring-0"
					/>
					{error ? (
						<p className="text-xs text-destructive">{error}</p>
					) : trimmedSlug !== "" && !slugValid ? (
						<p className="text-xs text-muted-foreground">
							Lowercase letters, numbers and hyphens only; can't start or end
							with a hyphen.
						</p>
					) : null}
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={handleClose} disabled={actionBusy}>
						Cancel
					</Button>
					<Button onClick={handleCreate} disabled={!canCreate}>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
