"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crosmos/ui/components/tabs";
import { MembersSettings } from "@/components/settings/members-settings";
import { OrganizationSettings } from "@/components/settings/organization-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";

export default function SettingsPage() {
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
					<TabsTrigger value="members">Members</TabsTrigger>
					<TabsTrigger value="organization">Organization</TabsTrigger>
					<TabsTrigger value="profile">Profile</TabsTrigger>
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
			</Tabs>
		</div>
	);
}
