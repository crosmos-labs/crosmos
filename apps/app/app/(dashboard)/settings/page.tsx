"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crosmos/ui/components/tabs";
import {
	IconBuilding,
	IconEye,
	IconUserCircle,
	IconUsers,
} from "@tabler/icons-react";
import { MembersSettings } from "@/components/settings/members-settings";
import { OrganizationSettings } from "@/components/settings/organization-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { VisibilitySettings } from "@/components/settings/visibility/visibility-settings";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useOrg } from "@/hooks/use-org";

export default function SettingsPage() {
	const { data: user } = useCurrentUser();
	const { data: org } = useOrg(user?.active_org_id ?? null);
	// Visibility is owner/admin-only — append the tab once the role resolves
	// (fail closed: hidden until we know, hidden for plain members).
	const canManageVisibility =
		org?.your_role === "owner" || org?.your_role === "admin";

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your organization and its members.
				</p>
			</div>

			<Tabs defaultValue="members" className="gap-6">
				<TabsList variant="line">
					<TabsTrigger value="members">
						<IconUsers />
						Members
					</TabsTrigger>
					<TabsTrigger value="organization">
						<IconBuilding />
						Organization
					</TabsTrigger>
					<TabsTrigger value="profile">
						<IconUserCircle />
						Profile
					</TabsTrigger>
					{canManageVisibility && (
						<TabsTrigger value="visibility">
							<IconEye />
							Visibility
						</TabsTrigger>
					)}
				</TabsList>
				<TabsContent value="members">
					<MembersSettings />
				</TabsContent>
				<TabsContent value="organization">
					<OrganizationSettings />
				</TabsContent>
				<TabsContent value="profile">
					<ProfileSettings />
				</TabsContent>
				{canManageVisibility && (
					<TabsContent value="visibility">
						<VisibilitySettings />
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
