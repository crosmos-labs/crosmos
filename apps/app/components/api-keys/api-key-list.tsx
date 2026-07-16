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
import { cn } from "@crosmos/ui/lib/utils";
import { IconDotsVertical, IconKey } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { createApiKey, revokeApiKey } from "@/actions/api-keys";
import { CreateKeyDialog } from "@/components/api-keys/create-key-dialog";
import { RevokeKeyDialog } from "@/components/api-keys/revoke-key-dialog";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { optimisticInsert } from "@/lib/optimistic";
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
			</Button>
		</div>
	);
}

function KeyRow({
	apiKey,
	recent,
	isRevoking,
	onRevoke,
	actionsDisabled,
}: {
	apiKey: ApiKey;
	recent?: CreateApiKeyResponse;
	isRevoking: boolean;
	onRevoke: (key: ApiKey) => void;
	actionsDisabled: boolean;
}) {
	const isRecent = !!recent;
	const isOptimistic = apiKey.key_id.startsWith("optimistic-");
	const isMuted = isOptimistic || isRevoking;
	const showActions = !isRevoking;

	return (
		<Item
			variant="outline"
			className={cn(
				"px-4 py-3.5",
				isRecent && "border-green-500/30 bg-green-500/5 dark:bg-green-500/10",
				isMuted && "opacity-50",
			)}
		>
			<ItemContent>
				<ItemTitle className="flex items-center gap-2 text-base">
					{apiKey.name}
					{isRecent && (
						<Badge
							variant="outline"
							className="text-green-600 border-green-500/30 dark:text-green-400"
						>
							New
						</Badge>
					)}
					{showActions && <ExpiryBadge expiresAt={apiKey.expires_at} />}
				</ItemTitle>
				<ItemDescription>
					{isRecent ? (
						<span className="flex items-center gap-1.5">
							<code className="font-mono text-sm">{recent.raw_key}</code>
							<CopyButton value={recent.raw_key} />
						</span>
					) : (
						<code className="font-mono text-sm">
							{isOptimistic ? "•".repeat(40) : maskKey(apiKey.key_prefix)}
						</code>
					)}
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
					{isRevoking ? (
						<AnimatedSpinner name="braille" size="1.1em" speed={0.8} />
					) : isOptimistic ? (
						<AnimatedSpinner name="braille" size="1.1em" speed={0.8} />
					) : (
						formatDistanceToNow(new Date(apiKey.created_at), {
							addSuffix: true,
						})
					)}
				</span>
				{showActions && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Open actions for ${apiKey.name}`}
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
									onClick={() => onRevoke(apiKey)}
									disabled={actionsDisabled}
								>
									Revoke
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</ItemActions>
		</Item>
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
	const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());
	const [recentCreates, setRecentCreates] = useState<
		Map<string, CreateApiKeyResponse>
	>(new Map());
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	const activeKeys = useMemo(() => keys.filter((k) => k.is_active), [keys]);

	const handleRevoke = useCallback(
		(keyId: string) => {
			setRevokingIds((prev) => new Set(prev).add(keyId));
			runAction(
				async () => {
					await revokeApiKey(keyId);
					await mutate<ApiKey[]>(
						swrKey,
						(cache) =>
							(cache ?? []).map((k) =>
								k.key_id === keyId ? { ...k, is_active: false } : k,
							),
						{ revalidate: false },
					);
				},
				{
					toast: { success: "API key revoked", error: "Failed to revoke key" },
				},
			)
				.catch(() => {})
				.finally(() => {
					setRevokingIds((prev) => {
						const next = new Set(prev);
						next.delete(keyId);
						return next;
					});
				});
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

	const dialogs = (
		<>
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

	if (activeKeys.length === 0) {
		return (
			<>
				<KeyCountRow
					count={0}
					onCreateClick={() => setDialogOpen(true)}
					disabled={activeCount > 0}
				/>
				<EmptyState
					icon={IconKey}
					title="No API keys yet"
					description="Create an API key to authenticate requests to the Crosmos API."
				/>
				{dialogs}
			</>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<KeyCountRow
				count={activeKeys.length}
				onCreateClick={() => setDialogOpen(true)}
				disabled={activeCount > 0}
			/>
			<ItemGroup>
				{activeKeys.map((key) => (
					<KeyRow
						key={key.key_id}
						apiKey={key}
						recent={recentCreates.get(key.key_id)}
						isRevoking={revokingIds.has(key.key_id)}
						onRevoke={setRevokeKey}
						actionsDisabled={activeCount > 0}
					/>
				))}
			</ItemGroup>
			{dialogs}
		</div>
	);
}
