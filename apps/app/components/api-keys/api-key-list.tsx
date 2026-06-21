"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import { CopyButton } from "@crosmos/ui/components/copy-button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { useHotkey } from "@crosmos/ui/hooks/use-hotkey";
import { cn } from "@crosmos/ui/lib/utils";
import { IconDotsVertical, IconKey } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useState } from "react";
import { useSWRConfig } from "swr";
import { createApiKey, revokeApiKey } from "@/actions/api-keys";
import { CreateKeyDialog } from "@/components/api-keys/create-key-dialog";
import { RevokeKeyDialog } from "@/components/api-keys/revoke-key-dialog";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { HotkeyKbd } from "@/components/shared/hotkey-kbd";
import { optimisticInsert, optimisticRemove } from "@/lib/optimistic";
import type { ApiKey, CreateApiKeyResponse } from "@/lib/types/api-key";

export function maskKey(prefix: string) {
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

function SkeletonRow() {
	return (
		<Item variant="outline" size="lg">
			<ItemContent>
				<ItemTitle className="flex h-6 items-center gap-2 text-base">
					<Skeleton className="h-4 w-28" />
				</ItemTitle>
				<ItemDescription as="div" className="flex h-5 items-center">
					<Skeleton className="h-3 w-48" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-3 w-20" />
			</ItemActions>
		</Item>
	);
}

export function ApiKeyListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-8 w-20" />
			</div>
			<ItemGroup>
				{["a", "b", "c"].map((k) => (
					<SkeletonRow key={k} />
				))}
			</ItemGroup>
			<span className="sr-only">Loading API keys…</span>
		</div>
	);
}

export function ApiKeyList({
	keys,
	swrKey,
}: {
	keys: ApiKey[];
	swrKey: string;
}) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
	const [recentCreates, setRecentCreates] = useState<
		Map<string, CreateApiKeyResponse>
	>(new Map());
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	useHotkey("k", () => {
		if (activeCount > 0) return;
		setDialogOpen(true);
	});

	const handleRevoke = useCallback(
		(keyId: string) => {
			runAction(
				() =>
					optimisticRemove<ApiKey>(
						mutate,
						swrKey,
						(k) => k.key_id === keyId,
						() => revokeApiKey(keyId),
					),
				{
					toast: { success: "API key revoked", error: "Failed to revoke key" },
				},
			);
		},
		[runAction, mutate, swrKey],
	);

	const handleCreateKey = useCallback(
		(name: string, expiresInDays?: number) => {
			const now = new Date().toISOString();
			const tempKey: ApiKey = {
				key_id: `optimistic-${Date.now()}`,
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
				() =>
					optimisticInsert(mutate, swrKey, tempKey, async () => {
						const res = await createApiKey(name, expiresInDays);
						setRecentCreates((prev) => new Map(prev).set(res.key_id, res));
						return {
							...res,
							is_active: true,
							last_used_at: null,
							created_at: new Date().toISOString(),
						};
					}),
				{
					toast: { success: "API key created", error: "Failed to create key" },
				},
			);
		},
		[runAction, mutate, swrKey],
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
				<RevokeKeyDialog
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
					// Optimistic placeholders carry an "optimistic-" id prefix (see handleCreateKey).
					const isOptimistic = key.key_id.startsWith("optimistic-");

					return (
						<Item
							key={key.key_id}
							variant="outline"
							className={cn(
								"px-4 py-3.5",
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
										<AnimatedSpinner name="braille" size="1.1em" speed={0.8} />
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
			<RevokeKeyDialog
				revokeKey={revokeKey}
				onRevoke={handleRevoke}
				onOpenChange={(open) => {
					if (!open) setRevokeKey(null);
				}}
			/>
		</div>
	);
}
