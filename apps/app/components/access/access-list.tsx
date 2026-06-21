"use client";

import { Badge } from "@crosmos/ui/components/badge";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crosmos/ui/components/input-group";
import {
	Item,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { IconLock, IconSearch, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { GroupAvatar } from "@/components/groups/group-avatar";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { EmptyState } from "@/components/shared/empty-state";
import { RestrictedState } from "@/components/shared/restricted-state";
import { EnforcementSwitch } from "@/components/visibility/enforcement-switch";
import { useOrgRole } from "@/hooks/use-org-role";
import {
	useGrants,
	useGroups,
	visibilityGroupsKey,
} from "@/hooks/use-visibility";
import type { VisibilityGroup } from "@/lib/types/visibility";

function members(count: number) {
	return `${count} member${count === 1 ? "" : "s"}`;
}

function AccessListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<Skeleton className="h-16 w-full rounded-lg" />
			<Skeleton className="h-9 w-full max-w-xs" />
			<ItemGroup variant="default">
				{["a", "b", "c"].map((k) => (
					<Item key={k} variant="outline" className="items-start px-4 py-3.5">
						<Skeleton className="size-8 rounded-full" />
						<ItemContent className="gap-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-48" />
						</ItemContent>
					</Item>
				))}
			</ItemGroup>
			<span className="sr-only">Loading access…</span>
		</div>
	);
}

export function AccessList() {
	const { user, orgId, isOwnerAdmin } = useOrgRole();
	const currentUserId = user?.user_id ?? null;

	const {
		data: groups,
		isLoading,
		error,
	} = useGroups(isOwnerAdmin ? orgId : null);
	const { data: grants } = useGrants(isOwnerAdmin ? orgId : null);
	const { mutate } = useSWRConfig();

	const [search, setSearch] = useState("");

	if (user && !isOwnerAdmin) {
		return (
			<RestrictedState
				title="Access is restricted"
				description="Only organization owners and admins can manage access."
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
		return <AccessListSkeleton />;
	}

	const groupsById = new Map((groups ?? []).map((g) => [g.id, g]));
	const viewersBySubject = new Map<string, VisibilityGroup[]>();
	for (const grant of grants ?? []) {
		const viewer = groupsById.get(grant.viewer_group_id);
		if (!viewer) continue;
		const list = viewersBySubject.get(grant.subject_group_id) ?? [];
		list.push(viewer);
		viewersBySubject.set(grant.subject_group_id, list);
	}

	const q = search.trim().toLowerCase();
	const visible = (groups ?? []).filter(
		(g) =>
			!q ||
			g.name.toLowerCase().includes(q) ||
			g.slug.toLowerCase().includes(q),
	);

	return (
		<div className="flex flex-col gap-6">
			{orgId && (
				<EnforcementSwitch orgId={orgId} currentUserId={currentUserId} />
			)}

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

			{(groups?.length ?? 0) === 0 ? (
				<EmptyState
					icon={IconUsersGroup}
					title="No groups yet"
					description="Create groups first, then choose which groups can read each other's memories."
				/>
			) : visible.length === 0 ? (
				<p className="py-8 text-center text-sm text-muted-foreground">
					No groups match “{search}”.
				</p>
			) : (
				<ItemGroup variant="default">
					{visible.map((group) => {
						const viewers = viewersBySubject.get(group.id) ?? [];
						return (
							<Item
								key={group.id}
								asChild
								variant="outline"
								className="items-start px-4 py-3.5"
							>
								<Link href={`/access/${group.id}`}>
									<GroupAvatar name={group.name} seed={group.slug} />
									<ItemContent className="gap-2">
										<div className="flex items-center gap-2">
											<ItemTitle className="text-base">{group.name}</ItemTitle>
											<span className="text-sm text-muted-foreground">
												{members(group.member_count)}
											</span>
										</div>
										<div className="flex flex-col gap-1.5">
											<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
												Visible to
											</span>
											<div className="flex flex-wrap gap-1.5">
												{viewers.length === 0 ? (
													<Badge variant="outline">
														<IconLock className="size-3" />
														Only {group.name}
													</Badge>
												) : (
													viewers.map((v) => (
														<Badge key={v.id} variant="secondary">
															{v.name}
														</Badge>
													))
												)}
											</div>
										</div>
									</ItemContent>
								</Link>
							</Item>
						);
					})}
				</ItemGroup>
			)}
		</div>
	);
}
