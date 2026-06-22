"use client";

import { notFound } from "next/navigation";
import { MemberList } from "@/components/members/member-list";
import { isSettingsDisabled } from "@/lib/features";

export default function MembersPage() {
	if (isSettingsDisabled) notFound();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Members</h1>
				<p className="text-sm text-muted-foreground">
					People in this workspace. Workspace roles control billing and admin.
				</p>
			</div>
			<MemberList />
		</div>
	);
}
