"use client";

import { GroupList } from "@/components/groups/group-list";

export default function GroupsPage() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Groups</h1>
				<p className="text-sm text-muted-foreground">
					Organize people into groups. Each group has its own members and access
					settings.
				</p>
			</div>
			<GroupList />
		</div>
	);
}
