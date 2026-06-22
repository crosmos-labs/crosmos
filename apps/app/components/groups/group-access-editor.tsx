"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crosmos/ui/components/collapsible";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import { IconCheck, IconChevronRight, IconX } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { createGrant, deleteGrant } from "@/actions/visibility";
import { GroupAvatar } from "@/components/groups/group-avatar";
import { RemoveAccessDialog } from "@/components/groups/remove-access-dialog";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { EntityPickerPopover } from "@/components/shared/entity-picker-popover";
import { HoverMeta } from "@/components/shared/hover-meta";
import {
	useGrants,
	useGroups,
	visibilityGrantsKey,
} from "@/hooks/use-visibility";
import { optimisticInsert, optimisticRemove } from "@/lib/optimistic";
import type { VisibilityGrant, VisibilityGroup } from "@/lib/types/visibility";

function members(count: number) {
	return `${count} member${count === 1 ? "" : "s"}`;
}

function grantedLabel(grantedAt: string) {
	return `Access granted ${formatDistanceToNow(new Date(grantedAt), {
		addSuffix: true,
	})}`;
}

export function GroupAccessEditor({
	orgId,
	group,
}: {
	orgId: string;
	group: VisibilityGroup;
}) {
	const { data: grants, isLoading, error: grantsError } = useGrants(orgId);
	const { data: groups } = useGroups(orgId);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const busy = activeCount > 0;
	const [canAlsoOpen, setCanAlsoOpen] = useState(false);
	const [removeTarget, setRemoveTarget] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const groupsById = new Map((groups ?? []).map((g) => [g.id, g]));
	const resolve = (id: string, slug: string): VisibilityGroup =>
		groupsById.get(id) ?? {
			id,
			name: slug,
			slug,
			member_count: 0,
			created_at: "",
			updated_at: "",
		};

	const viewerGrants = (grants ?? []).filter(
		(g) => g.subject_group_id === group.id,
	);
	const subjectGrants = (grants ?? []).filter(
		(g) => g.viewer_group_id === group.id,
	);
	const viewerIds = new Set(viewerGrants.map((g) => g.viewer_group_id));
	const pickable = (groups ?? []).filter((g) => g.id !== group.id);

	function handleAdd(picked: VisibilityGroup) {
		const placeholder: VisibilityGrant = {
			id: `optimistic-${Date.now()}`,
			viewer_group_id: picked.id,
			viewer_group_slug: picked.slug,
			subject_group_id: group.id,
			subject_group_slug: group.slug,
			created_at: new Date().toISOString(),
		};
		runAction(
			() =>
				optimisticInsert(
					mutate,
					visibilityGrantsKey(orgId),
					placeholder,
					async () => {
						const result = await createGrant(orgId, picked.id, group.id);
						if (!result.ok) {
							throw Object.assign(new Error(result.message), {
								code: result.code,
							});
						}
						return result.data;
					},
				),
			{ toast: { success: "Access granted" } },
		).catch((err: unknown) => {
			const code =
				err && typeof err === "object" && "code" in err
					? (err as { code: unknown }).code
					: null;
			if (code === "grant_cycle") {
				toast.error("That would create a circular access rule.");
				return;
			}
			toast.error(err instanceof Error ? err.message : "Couldn't grant access");
		});
	}

	function handleRemove(grantId: string) {
		runAction(
			() =>
				optimisticRemove<VisibilityGrant>(
					mutate,
					visibilityGrantsKey(orgId),
					(g) => g.id === grantId,
					() => deleteGrant(orgId, grantId),
				),
			{
				toast: { success: "Access removed", error: "Failed to remove access" },
			},
		);
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="flex flex-col gap-1">
						<h2 className="text-base font-medium">
							Who can read these memories
						</h2>
						<p className="text-sm text-muted-foreground">
							Choose which groups can read memories created by {group.name}.
						</p>
					</div>
					<EntityPickerPopover
						triggerLabel="Add group"
						searchPlaceholder="Choose a group"
						emptyLabel="No groups found."
						disabled={busy || !groups || !grants}
						items={pickable.map((g) => {
							const added = viewerIds.has(g.id);
							return {
								id: g.id,
								value: `${g.name} ${g.slug}`,
								leading: <GroupAvatar name={g.name} seed={g.slug} size="xs" />,
								label: g.name,
								disabled: added,
								trailing: added ? (
									<Badge variant="secondary">
										<IconCheck className="size-3" />
										Already added
									</Badge>
								) : (
									<span className="text-xs text-muted-foreground">
										{g.member_count}
									</span>
								),
							};
						})}
						footer={(item) =>
							item && !item.disabled ? (
								<span>
									<span className="font-medium text-foreground">
										{item.label}
									</span>{" "}
									will be able to read{" "}
									<span className="font-medium text-foreground">
										{group.name}
									</span>
									's memories.
								</span>
							) : null
						}
						onSelect={(id) => {
							const picked = pickable.find((g) => g.id === id);
							if (picked) handleAdd(picked);
						}}
					/>
				</div>

				{isLoading && !grants ? (
					<ItemGroup>
						{["a", "b", "c"].map((k) => (
							<Item key={k} variant="outline" className="px-4 py-3.5">
								<Skeleton className="size-8 rounded-full" />
								<ItemContent>
									<ItemTitle className="h-5">
										<Skeleton className="h-4 w-28" />
									</ItemTitle>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				) : grantsError && !grants ? (
					<div className="flex items-center justify-between gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
						<span>Couldn't load access.</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => mutate(visibilityGrantsKey(orgId))}
						>
							Try again
						</Button>
					</div>
				) : viewerGrants.length === 0 ? (
					<div className="rounded-lg border p-4 text-sm text-muted-foreground">
						No groups can read these memories yet.
					</div>
				) : (
					<ItemGroup>
						{viewerGrants.map((grant) => {
							const vg = resolve(
								grant.viewer_group_id,
								grant.viewer_group_slug,
							);
							const isOptimistic = grant.id.startsWith("optimistic-");
							return (
								<Item
									key={grant.id}
									variant="outline"
									size="lg"
									className={cn(isOptimistic && "opacity-50")}
								>
									<GroupAvatar name={vg.name} seed={vg.slug} />
									<ItemContent className="h-8 justify-between gap-0">
										<ItemTitle className="text-sm leading-tight">
											<span className="min-w-0 truncate">{vg.name}</span>
										</ItemTitle>
										<HoverMeta
											base={members(vg.member_count)}
											hover={grantedLabel(grant.created_at)}
										/>
									</ItemContent>
									<ItemActions>
										{isOptimistic ? (
											<span className="flex size-8 items-center justify-center">
												<AnimatedSpinner
													name="braille"
													size="1.1em"
													speed={0.8}
												/>
											</span>
										) : (
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Remove access"
												disabled={busy}
												onClick={() =>
													setRemoveTarget({ id: grant.id, name: vg.name })
												}
												className="focus:ring-0 focus-visible:ring-0"
											>
												<IconX />
											</Button>
										)}
									</ItemActions>
								</Item>
							);
						})}
					</ItemGroup>
				)}
			</div>

			<Collapsible open={canAlsoOpen} onOpenChange={setCanAlsoOpen}>
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="flex items-center gap-2 text-sm font-medium"
					>
						<IconChevronRight
							className={cn(
								"size-4 transition-transform",
								canAlsoOpen && "rotate-90",
							)}
						/>
						Can also read memories from
						<span className="text-muted-foreground">
							({subjectGrants.length})
						</span>
					</button>
				</CollapsibleTrigger>
				<CollapsibleContent className="pt-3">
					{subjectGrants.length === 0 ? (
						<p className="px-1 text-sm text-muted-foreground">
							This group can't read other groups' memories.
						</p>
					) : (
						<ItemGroup>
							{subjectGrants.map((grant) => {
								const sg = resolve(
									grant.subject_group_id,
									grant.subject_group_slug,
								);
								return (
									<Item key={grant.id} variant="outline" size="lg">
										<GroupAvatar name={sg.name} seed={sg.slug} />
										<ItemContent className="h-8 justify-between gap-0">
											<ItemTitle className="text-sm leading-tight">
												<span className="min-w-0 truncate">{sg.name}</span>
											</ItemTitle>
											<HoverMeta
												base={members(sg.member_count)}
												hover={grantedLabel(grant.created_at)}
											/>
										</ItemContent>
									</Item>
								);
							})}
						</ItemGroup>
					)}
				</CollapsibleContent>
			</Collapsible>

			<RemoveAccessDialog
				viewerName={removeTarget?.name ?? null}
				subjectName={group.name}
				onConfirm={() => {
					if (removeTarget) handleRemove(removeTarget.id);
					setRemoveTarget(null);
				}}
				onOpenChange={(open) => {
					if (!open) setRemoveTarget(null);
				}}
			/>
		</div>
	);
}
