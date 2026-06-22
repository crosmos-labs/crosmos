"use client";

import { Skeleton } from "@crosmos/ui/components/skeleton";
import { IconLock } from "@tabler/icons-react";
import { use, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { GroupAccessEditor } from "@/components/groups/group-access-editor";
import { GroupHeader } from "@/components/groups/group-header";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { EmptyState } from "@/components/shared/empty-state";
import { RestrictedState } from "@/components/shared/restricted-state";
import { useOrgRole } from "@/hooks/use-org-role";
import { useGroups, visibilityGroupsKey } from "@/hooks/use-visibility";

function AccessRuleSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-6">
			<div className="flex items-start gap-4">
				<Skeleton className="size-10 rounded-full" />
				<div className="flex flex-1 flex-col gap-2">
					<Skeleton className="h-7 w-40" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
			<Skeleton className="h-5 w-56" />
			<span className="sr-only">Loading access rule…</span>
		</div>
	);
}

export default function AccessRulePage({
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
	const group = groups?.find((g) => g.id === groupId);

	const { setBreadcrumb } = useBreadcrumb();
	const { mutate } = useSWRConfig();
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (group) {
			setBreadcrumb({
				label: group.name,
				parent: { label: "Access", href: "/access" },
			});
		}
		return () => setBreadcrumb(null);
	}, [group, setBreadcrumb]);

	if (isDeleting) {
		return <AccessRuleSkeleton />;
	}

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
		return <AccessRuleSkeleton />;
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
				backHref="/access"
				onDeleting={() => setIsDeleting(true)}
			/>
			<GroupAccessEditor orgId={orgId} group={group} />
		</div>
	);
}
