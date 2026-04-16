"use client";

import {
	createApiKey,
	revokeApiKey,
	type ApiKey,
	type CreateApiKeyResponse,
} from "@/actions/api-keys";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Button } from "@crosmos/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crosmos/ui/components/empty";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crosmos/ui/components/dialog";
import { Input } from "@crosmos/ui/components/input";
import { PulseSpinner } from "@/components/pulse-spinner";
import { formatDistanceToNow } from "date-fns";
import {
	IconDotsVertical,
	IconKey,
	IconPlus,
	IconCopy,
} from "@tabler/icons-react";
import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";

function maskKey(prefix: string) {
	return prefix + "*".repeat(Math.max(0, 36 - prefix.length));
}

function CreateKeyDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [name, setName] = useState("");
	const [isPending, startTransition] = useTransition();
	const [createdKey, setCreatedKey] = useState<CreateApiKeyResponse | null>(
		null,
	);
	const router = useRouter();

	function handleClose() {
		setName("");
		setCreatedKey(null);
		onOpenChange(false);
		if (createdKey) {
			router.refresh();
		}
	}

	function handleCreate() {
		if (!name.trim()) return;
		startTransition(async () => {
			try {
				const res = await createApiKey(name.trim());
				setCreatedKey(res);
			} catch {
				// TODO: handle error
			}
		});
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{createdKey ? "API Key Created" : "Create API Key"}
					</DialogTitle>
					<DialogDescription>
						{createdKey
							? "Copy your API key now. You won't be able to see it again."
							: "Enter a name for your new API key."}
					</DialogDescription>
				</DialogHeader>
				{createdKey ? (
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
							<code className="flex-1 truncate font-mono text-xs">
								{createdKey.raw_key}
							</code>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={() =>
									navigator.clipboard.writeText(createdKey.raw_key)
								}
							>
								<IconCopy />
							</Button>
						</div>
					</div>
				) : (
					<Input
						placeholder="e.g. production-key"
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleCreate();
						}}
						disabled={isPending}
						className="focus-visible:border-input focus-visible:ring-0"
					/>
				)}
				<DialogFooter>
					{createdKey ? (
						<Button onClick={handleClose}>Done</Button>
					) : (
						<>
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button
								onClick={handleCreate}
								size="lg"
								disabled={!name.trim() || isPending}
							>
								{isPending ? <PulseSpinner /> : "Create"}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function ApiKeyList({ keys }: { keys: ApiKey[] }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const handleRevoke = useCallback(
		(keyId: number) => {
			startTransition(async () => {
				try {
					await revokeApiKey(keyId);
					router.refresh();
				} catch {
					// TODO: handle error
				}
			});
		},
		[router],
	);

	const countRow = (
		<div className="flex items-center justify-between">
			<span className="text-sm text-muted-foreground">
				{keys.length} key{keys.length !== 1 ? "s" : ""}
			</span>
			<Button
				variant="default"
				size="sm"
				className="bg-accent text-accent-foreground"
				onClick={() => setDialogOpen(true)}
			>
				<IconPlus data-icon="inline-start" />
				Create
			</Button>
		</div>
	);

	if (keys.length === 0) {
		return (
			<>
				{countRow}
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
				<CreateKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
			</>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{countRow}
			<ItemGroup>
				{keys.map((key) => (
					<Item
						key={key.key_id}
						variant="outline"
						className="hover:bg-muted/50"
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
										className="focus-visible:ring-0 focus-visible:outline-none"
									>
										<IconDotsVertical />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuGroup>
										<DropdownMenuItem
											variant="destructive"
											onClick={() => handleRevoke(key.key_id)}
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
			<CreateKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
		</div>
	);
}
