"use client";

import { Skeleton } from "@crosmos/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crosmos/ui/components/tabs";
import { IconLock } from "@tabler/icons-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { use, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { GroupAccessEditor } from "@/components/groups/group-access-editor";
import { GroupHeader } from "@/components/groups/group-header";
import { GroupMembersTab } from "@/components/groups/group-members-tab";
import { GroupOverview } from "@/components/groups/group-overview";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { EmptyState } from "@/components/shared/empty-state";
import { RestrictedState } from "@/components/shared/restricted-state";
import { useOrgRole } from "@/hooks/use-org-role";
import {
	useGrants,
	useGroups,
	visibilityGroupsKey,
} from "@/hooks/use-visibility";

const tabParser = parseAsStringEnum([
	"overview",
	"members",
	"access",
]).withDefault("overview");

function GroupDetailSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<div className="flex items-start gap-4">
				<Skeleton className="size-10 rounded-full" />
				<div className="flex flex-1 flex-col gap-2">
					<Skeleton className="h-7 w-40" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
			<Skeleton className="h-8 w-64" />
			<div className="grid gap-4 sm:grid-cols-3">
				{["a", "b", "c"].map((k) => (
					<Skeleton key={k} className="h-20 w-full rounded-xl" />
				))}
			</div>
			<span className="sr-only">Loading group…</span>
		</div>
	);
}

export default function GroupDetailPage({
	params,
}: {
	params: Promise<{ groupId: string }>;
}) {
	const { groupId } = use(params);
	const { user, orgId, isOwnerAdmin } = useOrgRole();

	const {
		data: groups,
		isLoading,
		error,
	} = useGroups(isOwnerAdmin ? orgId : null);
	const { data: grants } = useGrants(isOwnerAdmin ? orgId : null);
	const group = groups?.find((g) => g.id === groupId);

	const { setBreadcrumb } = useBreadcrumb();
	const { mutate } = useSWRConfig();
	const [tab, setTab] = useQueryState("tab", tabParser);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (group) {
			setBreadcrumb({
				label: group.name,
				parent: { label: "Groups", href: "/groups" },
			});
		}
		return () => setBreadcrumb(null);
	}, [group, setBreadcrumb]);

	if (isDeleting) {
		return <GroupDetailSkeleton />;
	}

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
		return <GroupDetailSkeleton />;
	}

	if (!group || !orgId) {
		return (
			<EmptyState
				icon={IconLock}
				title="Group not found"
				description="This group may have been deleted."
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<GroupHeader
				orgId={orgId}
				group={group}
				backHref="/groups"
				onDeleting={() => setIsDeleting(true)}
			/>
			<Tabs
				value={tab}
				onValueChange={(v) => setTab(v as typeof tab)}
				className="gap-6"
			>
				<TabsList variant="line">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="members">Members</TabsTrigger>
					<TabsTrigger value="access">Access</TabsTrigger>
				</TabsList>
				<TabsContent value="overview">
					<GroupOverview
						group={group}
						grants={grants ?? []}
						onManageAccess={() => setTab("access")}
					/>
				</TabsContent>
				<TabsContent value="members">
					<GroupMembersTab
						orgId={orgId}
						groupId={group.id}
						groupName={group.name}
					/>
				</TabsContent>
				<TabsContent value="access">
					<GroupAccessEditor orgId={orgId} group={group} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
