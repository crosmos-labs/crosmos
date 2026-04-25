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
import { Badge } from "@crosmos/ui/components/badge";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import { IconDotsVertical, IconKey, IconPlus } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useState } from "react";
import { mutate } from "swr";
import { createApiKey, revokeApiKey } from "@/actions/api-keys";
import { NewKeyBanner } from "@/components/new-key-banner";
import { useActionLoader, useActionLoaderState } from "@/components/providers/action-loader-provider";
import type { ApiKey, CreateApiKeyResponse } from "@/lib/types/api-key";

function maskKey(prefix: string) {
	return prefix + "*".repeat(Math.max(0, 36 - prefix.length));
}

function ExpiryBadge({ expiresAt }: { expiresAt: string | null }) {
	if (!expiresAt) return null;

	const expires = new Date(expiresAt);
	const now = new Date();
	const daysLeft = Math.ceil(
		(expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (daysLeft <= 0) {
		return <Badge variant="destructive">Expired</Badge>;
	}

	const label = `expires ${formatDistanceToNow(expires, { addSuffix: true })}`;

	if (daysLeft <= 7) {
		return <Badge variant="destructive">{label}</Badge>;
	}

	return <Badge variant="secondary">{label}</Badge>;
}

function CreateKeyDialog({
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
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const handleRevoke = useCallback(
		(keyId: number) => {
			runAction(async () => {
				await revokeApiKey(keyId);
				await mutate("/api-keys");
			}, {
				toast: { success: "API key revoked", error: "Failed to revoke key" },
			});
		},
		[runAction],
	);

	const handleCreateKey = useCallback(
		(name: string, expiresInDays?: number) => {
			runAction(async () => {
				const res = await createApiKey(name, expiresInDays);
				setCreatedKeys((prev) => [...prev, res]);
				await mutate("/api-keys");
			}, {
				toast: { success: "API key created", error: "Failed to create key" },
			});
		},
		[runAction],
	);

	const handleDismissCreatedKey = useCallback((keyId: number) => {
		setCreatedKeys((prev) => prev.filter((k) => k.key_id !== keyId));
	}, []);

	function KeyCountRow({
		count,
		onCreateClick,
		disabled,
	}: {
		count: number;
		onCreateClick: () => void;
		disabled?: boolean;
	}) {
		return (
			<div className="flex items-center justify-between">
				<span className="text-sm text-muted-foreground">
					{count} key{count !== 1 ? "s" : ""}
				</span>
				<Button onClick={onCreateClick} disabled={disabled}>
					<IconPlus data-icon="inline-start" />
					Create
				</Button>
			</div>
		);
	}

	if (keys.length === 0) {
		return (
			<>
				<KeyCountRow
					count={keys.length}
					onCreateClick={() => setDialogOpen(true)}
					disabled={activeCount > 0}
				/>
				{createdKeys.length > 0 && (
					<div className="flex flex-col gap-2">
						{createdKeys.map((key) => (
							<NewKeyBanner
								key={key.key_id}
								createdKey={key}
								onDismiss={handleDismissCreatedKey}
							/>
						))}
					</div>
				)}
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
			<KeyCountRow
				count={keys.length}
				onCreateClick={() => setDialogOpen(true)}
				disabled={activeCount > 0}
			/>
			{createdKeys.length > 0 && (
				<div className="flex flex-col gap-2">
					{createdKeys.map((key) => (
						<NewKeyBanner
							key={key.key_id}
							createdKey={key}
							onDismiss={handleDismissCreatedKey}
						/>
					))}
				</div>
			)}
			<ItemGroup>
				{keys.map((key) => (
					<Item
						key={key.key_id}
						variant="outline"
						className="hover:bg-muted/50 transition-colors hover:transition-none px-4 py-3.5"
					>
						<ItemContent>
							<ItemTitle className="flex items-center gap-2 text-base">
								{key.name}
								<ExpiryBadge expiresAt={key.expires_at} />
							</ItemTitle>
							<ItemDescription>
								<code className="font-mono text-sm">
									{maskKey(key.key_prefix)}
								</code>
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<span className="text-sm text-muted-foreground whitespace-nowrap">
								{formatDistanceToNow(new Date(key.created_at), {
									addSuffix: true,
								})}
							</span>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon-sm"
										aria-label={`Open actions for ${key.name}`}
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
											disabled={activeCount > 0}
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
							if (revokeKey) {
								onRevoke(revokeKey.key_id);
								onOpenChange(false);
							}
						}}
					>
						Revoke
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
