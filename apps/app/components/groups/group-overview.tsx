"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crosmos/ui/components/card";
import { IconArrowRight } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import type { VisibilityGrant, VisibilityGroup } from "@/lib/types/visibility";

function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<Card className="gap-0">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<span className="text-xl font-semibold tracking-tight">{value}</span>
			</CardContent>
		</Card>
	);
}

export function GroupOverview({
	group,
	grants,
	onManageAccess,
}: {
	group: VisibilityGroup;
	grants: VisibilityGrant[];
	onManageAccess: () => void;
}) {
	const groupsWithAccess = grants.filter(
		(g) => g.subject_group_id === group.id,
	).length;

	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
				<Stat label="Members" value={group.member_count} />
				<Stat label="Groups with access" value={groupsWithAccess} />
				<Stat
					label="Created"
					value={formatDistanceToNow(new Date(group.created_at), {
						addSuffix: true,
					})}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-muted-foreground">About</span>
				<p className="text-sm">No description.</p>
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-muted-foreground">
					Activity
				</span>
				<div className="rounded-lg border p-4 text-sm text-muted-foreground">
					No recent activity.
				</div>
			</div>

			<Button variant="ghost" className="w-fit" onClick={onManageAccess}>
				Manage access
				<IconArrowRight />
			</Button>
		</div>
	);
}
