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
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crosmos/ui/components/tooltip";
import {
	IconCornerDownLeft,
	IconInfoCircle,
	IconShieldCheck,
	IconUsersGroup,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { updateVisibilitySettings } from "@/actions/visibility";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import {
	useGrants,
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
	const {
		data: grants,
		isLoading: grantsLoading,
		error: grantsError,
	} = useGrants(orgId);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const [busy, setBusy] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const loading = data === undefined;
	const enabled = data?.visibility_enabled ?? false;
	const key = visibilitySettingsKey(orgId);
	const pending = loading || grantsLoading || busy;

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
			await runAction(async () => {
				await mutate(key, { visibility_enabled: next }, { revalidate: false });
				const result = await updateVisibilitySettings(orgId, next);
				if (!result.ok) {
					throw new Error(result.message || "Couldn't update enforcement");
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
			});
			toast.success(
				next ? "Group access rules activated" : "Group access rules paused",
			);
		} catch (error) {
			await mutate(key).catch(() => {});
			toast.error(
				error instanceof Error ? error.message : "Couldn't update enforcement",
			);
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border p-4">
			<div className="flex flex-col gap-1">
				<span className="flex items-center gap-1.5 text-sm font-medium">
					Group access rules
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-label="About group access rules"
								className="inline-flex items-center text-muted-foreground hover:text-foreground"
							>
								<IconInfoCircle className="size-3.5" />
							</button>
						</TooltipTrigger>
						<TooltipContent
							className="max-w-64 flex flex-col gap-1"
							side="right"
							align="start"
						>
							<span>
								<span className="font-medium text-foreground">On</span> — group
								grants apply to private memories.
							</span>
							<span>
								<span className="font-medium text-foreground">Off</span> — group
								grants are paused; members read their own private memories plus
								org-shared content.
							</span>
						</TooltipContent>
					</Tooltip>
				</span>
				<span className="text-sm text-muted-foreground">
					Activate saved group grants for private memories.
				</span>
			</div>
			<Switch
				checked={enabled}
				disabled={pending}
				aria-label="Group access rules"
				onCheckedChange={(checked) => {
					if (pending) return;
					if (checked) {
						if (grantsError) {
							toast.error(
								"Couldn't verify saved rules. Refresh and try again.",
							);
							return;
						}
						if ((grants?.length ?? 0) > 0) {
							setConfirmOpen(true);
							return;
						}
						applyToggle(true);
						return;
					}
					applyToggle(false);
				}}
			/>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Activate group access rules?</AlertDialogTitle>
						<AlertDialogDescription>
							Saved rules will start granting access to private memories
							immediately.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex flex-col gap-2">
						<div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
							<IconShieldCheck className="mt-0.5 text-muted-foreground" />
							<div className="flex min-w-0 flex-col gap-1">
								<span className="text-sm font-medium">
									Saved grants become active
								</span>
								<span className="text-sm text-muted-foreground">
									Private memories remain private by default, but group grants
									can add readers.
								</span>
							</div>
						</div>
						<div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
							<IconUsersGroup className="mt-0.5 text-muted-foreground" />
							<div className="flex min-w-0 flex-col gap-1">
								<span className="text-sm font-medium">Access may broaden</span>
								<span className="text-sm text-muted-foreground">
									Members in viewer groups can read private memories owned by
									subject groups, including transitive grants.
								</span>
							</div>
						</div>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel variant="ghost">
							Cancel <Kbd>Esc</Kbd>
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setConfirmOpen(false);
								applyToggle(true);
							}}
						>
							Activate rules{" "}
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
