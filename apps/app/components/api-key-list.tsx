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
import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import { CopyButton } from "@crosmos/ui/components/copy-button";
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
import { Input } from "@crosmos/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Kbd } from "@crosmos/ui/components/kbd";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import { useHotkey } from "@crosmos/ui/hooks/use-hotkey";
import { cn } from "@crosmos/ui/lib/utils";
import {
	IconCornerDownLeft,
	IconDotsVertical,
	IconKey,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { createApiKey, revokeApiKey } from "@/actions/api-keys";
import { EmptyState } from "@/components/empty-state";
import { HotkeyKbd } from "@/components/hotkey-kbd";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import type { ApiKey, CreateApiKeyResponse } from "@/lib/types/api-key";

function maskKey(prefix: string) {
	return prefix + "•".repeat(12);
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
					<Button variant="ghost" onClick={handleClose}>
						Cancel <Kbd>Esc</Kbd>
					</Button>
					<Button onClick={handleCreate} disabled={!name.trim()}>
						Create{" "}
						<Kbd>
							<IconCornerDownLeft />
						</Kbd>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

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
				Create
				<HotkeyKbd />
			</Button>
		</div>
	);
}

export function ApiKeyList({ keys }: { keys: ApiKey[] }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
	const [recentCreates, setRecentCreates] = useState<
		Map<number, CreateApiKeyResponse>
	>(new Map());
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	useHotkey("k", () => {
		if (activeCount > 0) return;
		setDialogOpen(true);
	});

	const handleRevoke = useCallback(
		(keyId: number) => {
			runAction(
				async () => {
					await mutate(
						"/api-keys",
						async (current: ApiKey[] | undefined) => {
							await revokeApiKey(keyId);
							return current?.filter((k) => k.key_id !== keyId) ?? [];
						},
						{
							optimisticData: (current: ApiKey[] | undefined) =>
								current?.filter((k) => k.key_id !== keyId) ?? [],
							rollbackOnError: true,
							revalidate: false,
						},
					);
				},
				{
					toast: { success: "API key revoked", error: "Failed to revoke key" },
				},
			);
		},
		[runAction, mutate],
	);

	const handleCreateKey = useCallback(
		(name: string, expiresInDays?: number) => {
			const tempKeyId = -Date.now();
			const now = new Date().toISOString();
			const tempKey: ApiKey = {
				key_id: tempKeyId,
				name,
				key_prefix: "",
				is_active: true,
				expires_at: expiresInDays
					? new Date(Date.now() + expiresInDays * 86400000).toISOString()
					: null,
				last_used_at: null,
				created_at: now,
			};
			runAction(
				async () => {
					await mutate(
						"/api-keys",
						async (current: ApiKey[] | undefined) => {
							const res = await createApiKey(name, expiresInDays);
							setRecentCreates((prev) => new Map(prev).set(res.key_id, res));
							const apiKey: ApiKey = {
								...res,
								is_active: true,
								last_used_at: null,
								created_at: new Date().toISOString(),
							};
							return [apiKey, ...(current ?? [])];
						},
						{
							optimisticData: (current: ApiKey[] | undefined) => [
								tempKey,
								...(current ?? []),
							],
							rollbackOnError: true,
							revalidate: false,
						},
					);
				},
				{
					toast: { success: "API key created", error: "Failed to create key" },
				},
			);
		},
		[runAction, mutate],
	);

	if (keys.length === 0) {
		return (
			<>
				<KeyCountRow
					count={keys.length}
					onCreateClick={() => setDialogOpen(true)}
					disabled={activeCount > 0}
				/>
				<EmptyState
					icon={IconKey}
					title="No API keys yet"
					description="Create an API key to authenticate requests to the Crosmos API."
				/>
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
			<ItemGroup>
				{keys.map((key) => {
					const recent = recentCreates.get(key.key_id);
					const isRecent = !!recent;
					const isOptimistic = key.key_id < 0;

					return (
						<Item
							key={key.key_id}
							variant="outline"
							className={cn(
								"hover:bg-muted/50 transition-colors hover:transition-none px-4 py-3.5",
								isRecent &&
									"border-green-500/30 bg-green-500/5 dark:bg-green-500/10",
								isOptimistic && "opacity-50",
							)}
						>
							<ItemContent>
								<ItemTitle className="flex items-center gap-2 text-base">
									{key.name}
									{isRecent && (
										<Badge
											variant="outline"
											className="text-green-600 border-green-500/30 dark:text-green-400"
										>
											New
										</Badge>
									)}
									<ExpiryBadge expiresAt={key.expires_at} />
								</ItemTitle>
								<ItemDescription>
									{isRecent ? (
										<span className="flex items-center gap-1.5">
											<code className="font-mono text-sm">
												{recent.raw_key}
											</code>
											<CopyButton value={recent.raw_key} />
										</span>
									) : (
										<code className="font-mono text-sm">
											{isOptimistic ? "•".repeat(40) : maskKey(key.key_prefix)}
										</code>
									)}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
									{isOptimistic ? (
										<AnimatedSpinner
											name="diagswipe"
											size="1.1em"
											speed={0.8}
										/>
									) : (
										formatDistanceToNow(new Date(key.created_at), {
											addSuffix: true,
										})
									)}
								</span>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon-sm"
											aria-label={`Open actions for ${key.name}`}
											className={cn(
												"focus:ring-0 focus-visible:ring-0",
												isRecent &&
													"hover:bg-transparent dark:hover:bg-transparent aria-expanded:bg-transparent dark:aria-expanded:bg-transparent",
											)}
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
					);
				})}
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
