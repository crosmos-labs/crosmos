"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Button } from "@crosmos/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crosmos/ui/components/input-group";
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
import { IconSearch, IconUsersGroup } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { GroupAvatar } from "@/components/groups/group-avatar";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { EmptyState } from "@/components/shared/empty-state";
import { RestrictedState } from "@/components/shared/restricted-state";
import { CreateGroupDialog } from "@/components/visibility/create-group-dialog";
import { useOrgRole } from "@/hooks/use-org-role";
import { useGroups, visibilityGroupsKey } from "@/hooks/use-visibility";

function GroupSkeletonRow() {
	return (
		<Item variant="outline" className="px-4 py-3.5">
			<Skeleton className="size-8 rounded-full" />
			<ItemContent>
				<ItemTitle className="h-5">
					<Skeleton className="h-4 w-32" />
				</ItemTitle>
				<ItemDescription as="div" className="flex h-5 items-center">
					<Skeleton className="h-3.5 w-20" />
				</ItemDescription>
			</ItemContent>
		</Item>
	);
}

function GroupListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-9 w-full max-w-xs" />
				<Skeleton className="h-9 w-24" />
			</div>
			<ItemGroup>
				{["a", "b", "c", "d", "e"].map((k) => (
					<GroupSkeletonRow key={k} />
				))}
			</ItemGroup>
			<span className="sr-only">Loading groups…</span>
		</div>
	);
}

export function GroupList() {
	const { user, orgId, isOwnerAdmin } = useOrgRole();

	const {
		data: groups,
		isLoading,
		error,
	} = useGroups(isOwnerAdmin ? orgId : null);
	const { mutate } = useSWRConfig();

	const [search, setSearch] = useState("");
	const [createOpen, setCreateOpen] = useState(false);

	if (user && !isOwnerAdmin) {
		return (
			<RestrictedState
				title="Groups are restricted"
				description="Only organization owners and admins can manage groups."
			/>
		);
	}

	if (error) {
		return (
			<DataFetchError
				message={error.message}
				onRetry={() =>
					orgId ? mutate(visibilityGroupsKey(orgId)) : Promise.resolve()
				}
			/>
		);
	}

	if (!user || (isLoading && !groups)) {
		return <GroupListSkeleton />;
	}

	const q = search.trim().toLowerCase();
	const visible = (groups ?? []).filter(
		(g) =>
			!q ||
			g.name.toLowerCase().includes(q) ||
			g.slug.toLowerCase().includes(q),
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-2">
				<InputGroup className="max-w-xs">
					<InputGroupAddon align="inline-start">
						<IconSearch />
					</InputGroupAddon>
					<InputGroupInput
						placeholder="Search groups…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</InputGroup>
				<Button className="ml-auto" onClick={() => setCreateOpen(true)}>
					New group
				</Button>
			</div>

			{(groups?.length ?? 0) === 0 ? (
				<EmptyState
					icon={IconUsersGroup}
					title="No groups yet"
					description="Create a group to organize people and control who can read their memories."
				>
					<Button variant="outline" onClick={() => setCreateOpen(true)}>
						New group
					</Button>
				</EmptyState>
			) : visible.length === 0 ? (
				<p className="py-8 text-center text-sm text-muted-foreground">
					No groups match “{search}”.
				</p>
			) : (
				<ItemGroup>
					{visible.map((group) => {
						const isOptimistic = group.id.startsWith("optimistic-");
						return (
							<Item
								key={group.id}
								asChild
								variant="outline"
								className={cn("px-4 py-3.5", isOptimistic && "opacity-50")}
							>
								<Link href={`/groups/${group.id}`}>
									<GroupAvatar name={group.name} seed={group.slug} />
									<ItemContent>
										<ItemTitle className="text-base">{group.name}</ItemTitle>
										<ItemDescription>
											{group.member_count} member
											{group.member_count === 1 ? "" : "s"}
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<span className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground">
											{isOptimistic ? (
												<AnimatedSpinner
													name="braille"
													size="1.1em"
													speed={0.8}
												/>
											) : (
												<>
													Created{" "}
													{formatDistanceToNow(new Date(group.created_at), {
														addSuffix: true,
													})}
												</>
											)}
										</span>
									</ItemActions>
								</Link>
							</Item>
						);
					})}
				</ItemGroup>
			)}

			{orgId && (
				<CreateGroupDialog
					orgId={orgId}
					open={createOpen}
					onOpenChange={setCreateOpen}
				/>
			)}
		</div>
	);
}
