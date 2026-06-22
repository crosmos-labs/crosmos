"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { IconX } from "@tabler/icons-react";
import { useSWRConfig } from "swr";
import { addGroupMember, removeGroupMember } from "@/actions/visibility";
import { MemberAvatar } from "@/components/members/member-avatar";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { EntityPickerPopover } from "@/components/shared/entity-picker-popover";
import { useMembers } from "@/hooks/use-members";
import {
	useGroupMembers,
	visibilityGroupMembersKey,
} from "@/hooks/use-visibility";
import { optimisticInsert, optimisticRemove } from "@/lib/optimistic";
import type { GroupMember } from "@/lib/types/visibility";

export function GroupMembersTab({
	orgId,
	groupId,
	groupName,
}: {
	orgId: string;
	groupId: string;
	groupName: string;
}) {
	const {
		data: groupMembers,
		isLoading,
		error,
	} = useGroupMembers(orgId, groupId);
	const { data: orgMembers } = useMembers(orgId);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const busy = activeCount > 0;

	const key = visibilityGroupMembersKey(orgId, groupId);
	const memberIds = new Set((groupMembers ?? []).map((m) => m.user_id));
	const candidates = (orgMembers ?? []).filter(
		(m) => !memberIds.has(m.user_id),
	);

	function handleAdd(member: { user_id: string; email: string; name: string }) {
		const placeholder: GroupMember = {
			user_id: member.user_id,
			email: member.email,
			name: member.name,
		};
		runAction(
			() =>
				optimisticInsert(mutate, key, placeholder, async () => {
					await addGroupMember(orgId, groupId, member.user_id);
					return placeholder;
				}),
			{ toast: { success: "Member added", error: "Failed to add member" } },
		);
	}

	function handleRemove(userId: string) {
		runAction(
			() =>
				optimisticRemove<GroupMember>(
					mutate,
					key,
					(m) => m.user_id === userId,
					() => removeGroupMember(orgId, groupId, userId),
				),
			{
				toast: { success: "Member removed", error: "Failed to remove member" },
			},
		);
	}

	const count = groupMembers?.length ?? 0;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-2">
				{isLoading && !groupMembers ? (
					<Skeleton className="h-5 w-44" />
				) : groupMembers ? (
					<p className="text-sm text-muted-foreground">
						{count} {count === 1 ? "person is" : "people are"} in {groupName}.
					</p>
				) : (
					<span />
				)}
				<EntityPickerPopover
					triggerLabel="Add member"
					searchPlaceholder="Search people…"
					emptyLabel="No people found."
					disabled={busy || !groupMembers || !orgMembers}
					items={candidates.map((m) => ({
						id: m.user_id,
						value: `${m.name} ${m.email}`,
						leading: <MemberAvatar name={m.name} email={m.email} size="sm" />,
						label: m.name || m.email,
					}))}
					onSelect={(id) => {
						const picked = candidates.find((m) => m.user_id === id);
						if (picked) handleAdd(picked);
					}}
				/>
			</div>

			{isLoading && !groupMembers ? (
				<ItemGroup>
					{["a", "b", "c", "d"].map((k) => (
						<Item key={k} variant="outline" className="px-4 py-3.5">
							<Skeleton className="size-8 rounded-full" />
							<ItemContent>
								<ItemTitle className="h-5">
									<Skeleton className="h-4 w-32" />
								</ItemTitle>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			) : error && !groupMembers ? (
				<div className="flex items-center justify-between gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
					<span>Couldn't load members.</span>
					<Button variant="outline" size="sm" onClick={() => mutate(key)}>
						Try again
					</Button>
				</div>
			) : count === 0 ? (
				<div className="rounded-lg border p-4 text-sm text-muted-foreground">
					No members in this group yet.
				</div>
			) : (
				<ItemGroup>
					{(groupMembers ?? []).map((member) => (
						<Item
							key={member.user_id}
							variant="outline"
							className="px-4 py-3.5"
						>
							<MemberAvatar name={member.name} email={member.email} />
							<ItemContent>
								<ItemTitle className="text-base">
									<span className="min-w-0 truncate">
										{member.name || member.email}
									</span>
								</ItemTitle>
							</ItemContent>
							<ItemActions>
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label="Remove from group"
									disabled={busy}
									onClick={() => handleRemove(member.user_id)}
									className="focus:ring-0 focus-visible:ring-0"
								>
									<IconX />
								</Button>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			)}
		</div>
	);
}
