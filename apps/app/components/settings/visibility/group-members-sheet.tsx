"use client";

import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { Button } from "@crosmos/ui/components/button";
import { Checkbox } from "@crosmos/ui/components/checkbox";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crosmos/ui/components/input-group";
import { Kbd } from "@crosmos/ui/components/kbd";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crosmos/ui/components/sheet";
import {
	IconCornerDownLeft,
	IconSearch,
	IconUsersGroup,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { addGroupMember, removeGroupMember } from "@/actions/visibility";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { useMembers } from "@/hooks/use-members";
import {
	useGroupMembers,
	visibilityGroupMembersKey,
	visibilityGroupsKey,
} from "@/hooks/use-visibility";
import { avatarColor, getInitials } from "@/lib/members";
import { optimisticReplace } from "@/lib/optimistic";
import type { GroupMember } from "@/lib/types/visibility";

export function GroupMembersSheet({
	orgId,
	group,
	disabled = false,
	onOpenChange,
}: {
	orgId: string;
	group: { id: string; name: string } | null;
	disabled?: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const groupId = group?.id ?? null;
	const { data: members } = useGroupMembers(orgId, groupId);
	const { data: orgMembers } = useMembers(orgId);
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const [query, setQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const busy = activeCount > 0;

	const memberIds = useMemo(
		() => new Set((members ?? []).map((m) => m.user_id)),
		[members],
	);
	const filteredOrgMembers = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (normalizedQuery === "") return orgMembers ?? [];
		return (orgMembers ?? []).filter((member) =>
			`${member.name} ${member.email}`.toLowerCase().includes(normalizedQuery),
		);
	}, [orgMembers, query]);
	const addedCount = useMemo(
		() => [...selectedIds].filter((id) => !memberIds.has(id)).length,
		[selectedIds, memberIds],
	);
	const removedCount = useMemo(
		() => [...memberIds].filter((id) => !selectedIds.has(id)).length,
		[selectedIds, memberIds],
	);
	const hasChanges = addedCount > 0 || removedCount > 0;
	const loading = members === undefined || orgMembers === undefined;

	useEffect(() => {
		if (members === undefined) return;
		setSelectedIds(new Set(members.map((member) => member.user_id)));
	}, [members]);

	function handleOpenChange(open: boolean) {
		if (busy) return;
		if (!open) setQuery("");
		onOpenChange(open);
	}

	function toggleMember(userId: string, checked: boolean) {
		if (disabled || busy || loading) return;
		setSelectedIds((current) => {
			const next = new Set(current);
			if (checked) next.add(userId);
			else next.delete(userId);
			return next;
		});
	}

	function handleSave() {
		if (
			!groupId ||
			disabled ||
			busy ||
			loading ||
			!hasChanges ||
			!members ||
			!orgMembers
		) {
			return;
		}
		const idsToAdd = [...selectedIds].filter((id) => !memberIds.has(id));
		const idsToRemove = [...memberIds].filter((id) => !selectedIds.has(id));
		const selectedSnapshot = new Set(selectedIds);
		const nextMembers = orgMembers
			.filter((member) => selectedSnapshot.has(member.user_id))
			.map<GroupMember>((member) => ({
				user_id: member.user_id,
				email: member.email,
				name: member.name,
			}));
		const membersKey = visibilityGroupMembersKey(orgId, groupId);
		const groupsKey = visibilityGroupsKey(orgId);

		handleOpenChange(false);
		runAction(
			() =>
				optimisticReplace<GroupMember[]>(
					mutate,
					membersKey,
					nextMembers,
					() =>
						Promise.all([
							...idsToAdd.map((userId) =>
								addGroupMember(orgId, groupId, userId),
							),
							...idsToRemove.map((userId) =>
								removeGroupMember(orgId, groupId, userId),
							),
						]),
					{ also: [groupsKey] },
				),
			{
				toast: {
					success: "Group members updated",
					error: "Failed to update group members",
				},
			},
		).catch(() => {});
	}

	return (
		<Sheet open={group !== null} onOpenChange={handleOpenChange}>
			<SheetContent className="gap-0">
				<SheetHeader>
					<SheetTitle>{group?.name} members</SheetTitle>
					<SheetDescription>
						Select the users that belong to this group, then save changes.
					</SheetDescription>
				</SheetHeader>

				<div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
					<InputGroup>
						<InputGroupAddon align="inline-start">
							<IconSearch className="size-4" />
						</InputGroupAddon>
						<InputGroupInput
							placeholder="Search by name or email"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && hasChanges) {
									event.preventDefault();
									handleSave();
								}
							}}
							disabled={disabled || busy || loading}
						/>
					</InputGroup>

					{loading ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							Loading...
						</p>
					) : filteredOrgMembers.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
							<IconUsersGroup className="size-6 opacity-60" />
							{query.trim() ? "No members match your search." : "No members."}
						</div>
					) : (
						<ul className="min-h-0 flex-1 overflow-y-auto">
							{filteredOrgMembers.map((member) => (
								<li
									key={member.user_id}
									className="flex items-center gap-3 rounded-md px-1 py-2 hover:bg-muted/50"
								>
									<Checkbox
										id={`group-member-${member.user_id}`}
										checked={selectedIds.has(member.user_id)}
										disabled={disabled || busy || loading}
										onCheckedChange={(checked) =>
											toggleMember(member.user_id, checked === true)
										}
									/>
									<label
										htmlFor={`group-member-${member.user_id}`}
										className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
									>
										<Avatar size="sm">
											<AvatarFallback style={avatarColor(member.email)}>
												{getInitials(member.name || member.email)}
											</AvatarFallback>
										</Avatar>
										<span className="flex min-w-0 flex-col">
											<span className="truncate text-sm">
												{member.name || member.email}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{member.email}
											</span>
										</span>
									</label>
								</li>
							))}
						</ul>
					)}
				</div>

				<SheetFooter className="border-t bg-muted/50">
					<div className="flex items-center justify-between gap-3">
						<span className="text-xs text-muted-foreground">
							{hasChanges
								? `${addedCount} added, ${removedCount} removed`
								: "No unsaved changes"}
						</span>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								onClick={() => handleOpenChange(false)}
								disabled={busy}
							>
								Cancel <Kbd>Esc</Kbd>
							</Button>
							<Button
								onClick={handleSave}
								disabled={disabled || busy || loading || !hasChanges}
							>
								Save changes{" "}
								<Kbd>
									<IconCornerDownLeft />
								</Kbd>
							</Button>
						</div>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
