"use client";

import { Badge } from "@crosmos/ui/components/badge";
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
	visibilityGrantsKey,
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
			<ItemGroup>
				{["a", "b", "c", "d"].map((k) => (
					<Item key={k} variant="outline" size="lg">
						<Skeleton className="size-8 rounded-full" />
						<ItemContent className="h-8 justify-between gap-0">
							<Skeleton className="h-3.5 w-28" />
							<Skeleton className="h-3 w-16" />
						</ItemContent>
						<ItemActions>
							<Skeleton className="h-5 w-16 rounded-full" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</ItemActions>
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
	const { data: grants, error: grantsError } = useGrants(
		isOwnerAdmin ? orgId : null,
	);
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

	if (error || (grantsError && !grants)) {
		return (
			<DataFetchError
				message={(error ?? grantsError)?.message ?? "Couldn't load access."}
				onRetry={() => {
					if (!orgId) return Promise.resolve();
					return Promise.all([
						mutate(visibilityGroupsKey(orgId)),
						mutate(visibilityGrantsKey(orgId)),
					]);
				}}
			/>
		);
	}

	if (!user || (isLoading && !groups) || grants === undefined) {
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
				<ItemGroup>
					{visible.map((group) => {
						const viewers = viewersBySubject.get(group.id) ?? [];
						const shown = viewers.slice(0, 3);
						const extra = viewers.length - shown.length;
						return (
							<Item key={group.id} asChild variant="outline" size="lg">
								<Link href={`/access/${group.id}`}>
									<GroupAvatar name={group.name} seed={group.slug} />
									<ItemContent className="h-8 justify-between gap-0">
										<ItemTitle className="text-sm leading-tight">
											<span className="min-w-0 truncate">{group.name}</span>
										</ItemTitle>
										<ItemDescription className="text-xs leading-none line-clamp-1">
											{members(group.member_count)}
										</ItemDescription>
									</ItemContent>
									<ItemActions className="min-w-0 flex-wrap justify-end">
										{viewers.length === 0 ? (
											<Badge variant="outline">
												<IconLock className="size-3" />
												Only {group.name}
											</Badge>
										) : (
											<>
												<span className="text-xs text-muted-foreground">
													Visible to
												</span>
												{shown.map((v) => (
													<Badge key={v.id} variant="secondary">
														{v.name}
													</Badge>
												))}
												{extra > 0 && <Badge variant="outline">+{extra}</Badge>}
											</>
										)}
									</ItemActions>
								</Link>
							</Item>
						);
					})}
				</ItemGroup>
			)}
		</div>
	);
}
