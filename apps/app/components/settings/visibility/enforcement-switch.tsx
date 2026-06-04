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
import { Kbd } from "@crosmos/ui/components/kbd";
import { Switch } from "@crosmos/ui/components/switch";
import {
	IconCornerDownLeft,
	IconShieldOff,
	IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { updateVisibilitySettings } from "@/actions/visibility";
import {
	useVisibilitySettings,
	visibilitySettingsKey,
} from "@/hooks/use-visibility";

export function EnforcementSwitch({
	orgId,
	currentUserId,
	onPendingChange,
}: {
	orgId: string;
	currentUserId: string | null;
	onPendingChange?: (pending: boolean) => void;
}) {
	const { data } = useVisibilitySettings(orgId, currentUserId);
	const { mutate } = useSWRConfig();
	const [busy, setBusy] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const loading = data === undefined;
	const enabled = data?.visibility_enabled ?? false;
	const key = visibilitySettingsKey(orgId);
	const pending = loading || busy;

	useEffect(() => {
		onPendingChange?.(pending);
	}, [onPendingChange, pending]);

	function setPending(next: boolean) {
		setBusy(next);
		onPendingChange?.(next);
	}

	async function applyToggle(next: boolean) {
		setPending(true);
		try {
			await mutate(key, { visibility_enabled: next }, { revalidate: false });
			const result = await updateVisibilitySettings(orgId, next);
			if (!result.ok) {
				await mutate(key);
				toast.error(result.message || "Couldn't update enforcement");
				return;
			}
			await mutate(
				key,
				{ visibility_enabled: result.data.visibility_enabled },
				{ revalidate: false },
			);
			// Visible scope changes with enforcement — refresh any open preview reads.
			await mutate(
				(k) =>
					typeof k === "string" &&
					k.startsWith(`/orgs/${orgId}/visibility/preview`),
			);
			toast.success(
				next
					? "Visibility enforcement enabled"
					: "Visibility enforcement disabled",
			);
		} catch {
			await mutate(key).catch(() => {});
			toast.error("Couldn't update enforcement");
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border p-4">
			<div className="flex flex-col gap-1">
				<span className="text-sm font-medium">Visibility enforcement</span>
				<span className="text-sm text-muted-foreground">
					Apply access rules to control who can read private memories.
				</span>
			</div>
			<Switch
				checked={enabled}
				disabled={pending}
				aria-label="Visibility enforcement"
				onCheckedChange={(checked) => {
					if (pending) return;
					if (checked) applyToggle(true);
					else setConfirmOpen(true);
				}}
			/>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Disable visibility enforcement?</AlertDialogTitle>
						<AlertDialogDescription>
							This will broaden access to private memories until enforcement is
							turned back on.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex flex-col gap-2">
						<div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
							<IconShieldOff className="mt-0.5 text-muted-foreground" />
							<div className="flex min-w-0 flex-col gap-1">
								<span className="text-sm font-medium">
									Access rules pause immediately
								</span>
								<span className="text-sm text-muted-foreground">
									Groups and grants stay saved, but they will no longer limit
									reads.
								</span>
							</div>
						</div>
						<div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
							<IconUsers className="mt-0.5 text-muted-foreground" />
							<div className="flex min-w-0 flex-col gap-1">
								<span className="text-sm font-medium">
									Private memories may be visible org-wide
								</span>
								<span className="text-sm text-muted-foreground">
									Members can read using the broader org behavior until you
									re-enable enforcement.
								</span>
							</div>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel variant="ghost">
							Cancel <Kbd>Esc</Kbd>
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => {
								setConfirmOpen(false);
								applyToggle(false);
							}}
						>
							Disable enforcement{" "}
							<Kbd>
								<IconCornerDownLeft />
							</Kbd>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
