"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crosmos/ui/components/tabs";
import {
	IconRefresh,
	IconShieldLock,
	IconUsersGroup,
} from "@tabler/icons-react";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useGroups } from "@/hooks/use-visibility";
import { isOrgScopeMismatch } from "@/lib/org-mismatch";
import { AccessRulesSection } from "./access-rules-section";
import { EnforcementSwitch } from "./enforcement-switch";
import { GroupsSection } from "./groups-section";
import { PreviewSheet } from "./preview-sheet";

export function VisibilitySettings() {
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const currentUserId = user?.user_id ?? null;
	const [enforcementPending, setEnforcementPending] = useState(false);

	// Observe one org-scoped read to detect a stale active org (SWR shares the
	// cache with GroupsSection, so this doesn't double-fetch).
	const { error } = useGroups(orgId);

	if (!orgId) return null;

	if (isOrgScopeMismatch(error)) {
		return (
			<EmptyState
				icon={IconRefresh}
				title="This organization may have changed"
				description="Your active organization looks different from this view. Refresh to continue."
			>
				<Button
					variant="outline"
					onClick={() => {
						window.location.href = "/";
					}}
				>
					Refresh
				</Button>
			</EmptyState>
		);
	}

	return (
		<div className="flex flex-col gap-8">
			<EnforcementSwitch
				orgId={orgId}
				currentUserId={currentUserId}
				onPendingChange={setEnforcementPending}
			/>

			<Tabs defaultValue="groups" className="gap-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<TabsList variant="line">
						<TabsTrigger value="groups" disabled={enforcementPending}>
							<IconUsersGroup />
							Groups
						</TabsTrigger>
						<TabsTrigger value="access-rules" disabled={enforcementPending}>
							<IconShieldLock />
							Access rules
						</TabsTrigger>
					</TabsList>
					<PreviewSheet orgId={orgId} disabled={enforcementPending} />
				</div>

				<TabsContent value="groups">
					<GroupsSection orgId={orgId} disabled={enforcementPending} />
				</TabsContent>
				<TabsContent value="access-rules">
					<AccessRulesSection orgId={orgId} disabled={enforcementPending} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
