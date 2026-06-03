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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { createGrant } from "@/actions/visibility";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { visibilityGrantsKey } from "@/hooks/use-visibility";
import { optimisticInsert } from "@/lib/optimistic";
import type { VisibilityGrant, VisibilityGroup } from "@/lib/types/visibility";

export function AddRuleDialog({
	orgId,
	groups,
	grants,
	open,
	onOpenChange,
	disabled = false,
}: {
	orgId: string;
	groups: VisibilityGroup[];
	grants: VisibilityGrant[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	disabled?: boolean;
}) {
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const [viewerId, setViewerId] = useState("");
	const [subjectId, setSubjectId] = useState("");
	const actionBusy = activeCount > 0;

	// Prevent invalid pairs up front: hide the viewer itself (self_grant) and any
	// subject already granted to this viewer (duplicate_grant).
	const subjectOptions = useMemo(() => {
		if (!viewerId) return [];
		const alreadyGranted = new Set(
			grants
				.filter((g) => g.viewer_group_id === viewerId)
				.map((g) => g.subject_group_id),
		);
		return groups.filter((g) => g.id !== viewerId && !alreadyGranted.has(g.id));
	}, [viewerId, groups, grants]);

	function reset() {
		setViewerId("");
		setSubjectId("");
	}

	function handleClose() {
		reset();
		onOpenChange(false);
	}

	function handleCreate() {
		if (!viewerId || !subjectId || disabled || actionBusy) return;
		const viewerGroup = groups.find((group) => group.id === viewerId);
		const subjectGroup = groups.find((group) => group.id === subjectId);
		if (!viewerGroup || !subjectGroup) return;
		const now = new Date().toISOString();
		const tempGrant: VisibilityGrant = {
			id: `optimistic-${Date.now()}`,
			viewer_group_id: viewerId,
			viewer_group_slug: viewerGroup.slug,
			subject_group_id: subjectId,
			subject_group_slug: subjectGroup.slug,
			created_at: now,
		};
		const nextViewerId = viewerId;
		const nextSubjectId = subjectId;
		reset();
		onOpenChange(false);
		runAction(
			() =>
				optimisticInsert(
					mutate,
					visibilityGrantsKey(orgId),
					tempGrant,
					async () => {
						const result = await createGrant(
							orgId,
							nextViewerId,
							nextSubjectId,
						);
						if (!result.ok) {
							throw Object.assign(new Error(result.message), {
								code: result.code,
							});
						}
						return result.data;
					},
				),
			{ toast: { success: "Rule added" } },
		).catch((err: unknown) => {
			const code =
				err && typeof err === "object" && "code" in err
					? (err as { code: unknown }).code
					: null;
			if (code === "grant_cycle") {
				toast.error("That would create a circular access rule.");
			} else if (code === "duplicate_grant") {
				toast.error("That rule already exists.");
			} else if (code === "self_grant") {
				toast.error("A group already sees its own members.");
			} else {
				toast.error(err instanceof Error ? err.message : "Couldn't add rule");
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add access rule</DialogTitle>
					<DialogDescription>
						Let one group read another group's private memories.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-wrap items-center gap-2 text-sm">
					<Select
						value={viewerId}
						disabled={disabled || actionBusy}
						onValueChange={(v) => {
							setViewerId(v);
							setSubjectId("");
						}}
					>
						<SelectTrigger className="min-w-36">
							<SelectValue placeholder="Select group" />
						</SelectTrigger>
						<SelectContent>
							{groups.map((g) => (
								<SelectItem key={g.id} value={g.id}>
									{g.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<span className="text-muted-foreground">can read</span>
					<Select
						value={subjectId}
						onValueChange={(v) => {
							setSubjectId(v);
						}}
						disabled={disabled || actionBusy || !viewerId}
					>
						<SelectTrigger className="min-w-36">
							<SelectValue placeholder="Select group" />
						</SelectTrigger>
						<SelectContent>
							{subjectOptions.map((g) => (
								<SelectItem key={g.id} value={g.id}>
									{g.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<span className="text-muted-foreground">'s private memories.</span>
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={handleClose} disabled={actionBusy}>
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={!viewerId || !subjectId || disabled || actionBusy}
					>
						Add rule
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
