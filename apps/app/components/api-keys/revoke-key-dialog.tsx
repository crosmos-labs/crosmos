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
import { IconCornerDownLeft } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { maskKey } from "@/components/api-keys/api-key-list";
import type { ApiKey } from "@/lib/types/api-key";

export function RevokeKeyDialog({
	revokeKey,
	onRevoke,
	onOpenChange,
}: {
	revokeKey: ApiKey | null;
	onRevoke: (keyId: string) => void;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<AlertDialog open={!!revokeKey} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Revoke API Key</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="flex flex-col gap-3 text-left">
							<span>
								Are you sure you want to revoke this key? Any requests using it
								will be immediately rejected.
							</span>
							<div className="flex flex-col gap-1.5 rounded-lg border bg-muted/50 p-3 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Name</span>
									<span className="font-medium text-foreground">
										{revokeKey?.name}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Key</span>
									<code className="font-mono text-xs text-foreground">
										{revokeKey ? maskKey(revokeKey.key_prefix) : ""}
									</code>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Created</span>
									<span className="text-foreground">
										{revokeKey
											? formatDistanceToNow(new Date(revokeKey.created_at), {
													addSuffix: true,
												})
											: ""}
									</span>
								</div>
								{revokeKey?.last_used_at && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Last accessed</span>
										<span className="text-foreground">
											{formatDistanceToNow(new Date(revokeKey.last_used_at), {
												addSuffix: true,
											})}
										</span>
									</div>
								)}
								{revokeKey?.expires_at && (
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Expires</span>
										<span className="text-foreground">
											{new Date(revokeKey.expires_at).toLocaleDateString()}
										</span>
									</div>
								)}
							</div>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel variant="ghost">
						Cancel <Kbd>Esc</Kbd>
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							if (revokeKey) {
								onRevoke(revokeKey.key_id);
								onOpenChange(false);
							}
						}}
					>
						Revoke{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
