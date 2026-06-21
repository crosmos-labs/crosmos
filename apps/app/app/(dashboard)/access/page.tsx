"use client";

import { AccessList } from "@/components/access/access-list";

export default function AccessPage() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Access</h1>
				<p className="text-sm text-muted-foreground">
					Manage which groups can read memories from other groups. Click a group
					to edit.
				</p>
			</div>
			<AccessList />
		</div>
	);
}
