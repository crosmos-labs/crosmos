"use client";

import { MemberList } from "@/components/members/member-list";

export default function MembersPage() {
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
