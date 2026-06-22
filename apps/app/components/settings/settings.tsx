"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crosmos/ui/components/tabs";
import { IconBuilding, IconUserCircle } from "@tabler/icons-react";
import { OrganizationSettings } from "@/components/settings/organization-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";

export function Settings() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your organization and profile.
				</p>
			</div>

			<Tabs defaultValue="organization" className="gap-6">
				<TabsList variant="line">
					<TabsTrigger value="organization">
						<IconBuilding />
						Organization
					</TabsTrigger>
					<TabsTrigger value="profile">
						<IconUserCircle />
						Profile
					</TabsTrigger>
				</TabsList>
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
