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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crosmos/ui/components/empty";
import { Input } from "@crosmos/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { IconDotsVertical, IconKey, IconPlus } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
	type ApiKey,
	type CreateApiKeyResponse,
	createApiKey,
	revokeApiKey,
} from "@/actions/api-keys";
import { ApiKeyCreatedBanner } from "@/components/api-key-created-banner";
import { useActionLoader } from "@/components/providers/action-loader-provider";

function maskKey(prefix: string) {
	return prefix + "*".repeat(Math.max(0, 36 - prefix.length));
}

function CreateKeyDialog({
	open,
	onOpenChange,
	onCreateKey,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateKey: (name: string) => void;
}) {
	const [name, setName] = useState("");

	function handleClose() {
		setName("");
		onOpenChange(false);
	}

	function handleCreate() {
		if (!name.trim()) return;
		const keyName = name.trim();
		setName("");
		onOpenChange(false);
		onCreateKey(keyName);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create API Key</DialogTitle>
					<DialogDescription>
						Enter a name for your new API key.
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
				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleCreate} size="lg" disabled={!name.trim()}>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function ApiKeyList({ keys }: { keys: ApiKey[] }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
	const [createdKeys, setCreatedKeys] = useState<CreateApiKeyResponse[]>([]);
	const router = useRouter();
	const { runAction } = useActionLoader();

	const handleRevoke = useCallback(
		(keyId: number) => {
			runAction(() => revokeApiKey(keyId), {
				toast: { success: "API key revoked", error: "Failed to revoke key" },
			})
				.then(() => router.refresh())
				.catch(() => {});
		},
		[runAction, router],
	);

	const handleCreateKey = useCallback(
		(name: string) => {
			runAction(() => createApiKey(name), {
				toast: { success: "API key created", error: "Failed to create key" },
			})
				.then((res) => {
					setCreatedKeys((prev) => [...prev, res]);
					router.refresh();
				})
				.catch(() => {});
		},
		[runAction, router],
	);

	const handleDismissCreatedKey = useCallback((keyId: number) => {
		setCreatedKeys((prev) => prev.filter((k) => k.key_id !== keyId));
	}, []);

	const countRow = (
		<div className="flex items-center justify-between">
			<span className="text-sm text-muted-foreground">
				{keys.length} key{keys.length !== 1 ? "s" : ""}
			</span>
			<Button onClick={() => setDialogOpen(true)}>
				<IconPlus data-icon="inline-start" />
				Create
			</Button>
		</div>
	);

	if (keys.length === 0) {
		return (
			<>
				{countRow}
				<ApiKeyCreatedBanner
					createdKeys={createdKeys}
					onDismiss={handleDismissCreatedKey}
				/>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<IconKey />
						</EmptyMedia>
						<EmptyTitle>No API keys yet</EmptyTitle>
						<EmptyDescription>
							Create an API key to authenticate requests to the Crosmos API.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
				<CreateKeyDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
					onCreateKey={handleCreateKey}
				/>
				<RevokeAlertDialog
					revokeKey={revokeKey}
					onRevoke={handleRevoke}
					onOpenChange={(open) => {
						if (!open) setRevokeKey(null);
					}}
				/>
			</>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{countRow}
			<ApiKeyCreatedBanner
				createdKeys={createdKeys}
				onDismiss={handleDismissCreatedKey}
			/>
			<ItemGroup>
				{keys.map((key) => (
					<Item
						key={key.key_id}
						variant="outline"
						className="hover:bg-muted/50 transition-colors hover:transition-none"
					>
						<ItemContent>
							<ItemTitle>{key.name}</ItemTitle>
							<ItemDescription>
								<code className="font-mono text-xs">
									{maskKey(key.key_prefix)}
								</code>
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<span className="text-xs text-muted-foreground whitespace-nowrap">
								{formatDistanceToNow(new Date(key.created_at), {
									addSuffix: true,
								})}
							</span>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon-sm"
										className="focus:ring-0 focus-visible:ring-0"
									>
										<IconDotsVertical />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start">
									<DropdownMenuGroup>
										<DropdownMenuItem
											variant="destructive"
											onClick={() => setRevokeKey(key)}
										>
											Revoke
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</ItemActions>
					</Item>
				))}
			</ItemGroup>
			<CreateKeyDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onCreateKey={handleCreateKey}
			/>
			<RevokeAlertDialog
				revokeKey={revokeKey}
				onRevoke={handleRevoke}
				onOpenChange={(open) => {
					if (!open) setRevokeKey(null);
				}}
			/>
		</div>
	);
}

function RevokeAlertDialog({
	revokeKey,
	onRevoke,
	onOpenChange,
}: {
	revokeKey: ApiKey | null;
	onRevoke: (keyId: number) => void;
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
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							if (revokeKey) onRevoke(revokeKey.key_id);
						}}
					>
						Revoke
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
