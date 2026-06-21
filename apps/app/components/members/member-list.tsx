"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crosmos/ui/components/input-group";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crosmos/ui/components/item";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import {
	IconDotsVertical,
	IconLogout,
	IconMail,
	IconSearch,
	IconTrash,
	IconUserCog,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import {
	changeMemberRole,
	createInvite,
	removeMember,
	revokeInvite,
} from "@/actions/members";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import { MemberAvatar } from "@/components/members/member-avatar";
import { RemoveMemberDialog } from "@/components/members/remove-member-dialog";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useCurrentUser } from "@/hooks/use-current-user";
import { invitesKey, useInvites } from "@/hooks/use-invites";
import { membersKey, useMembers } from "@/hooks/use-members";
import { LAST_OWNER_MSG } from "@/lib/members";
import {
	optimisticInsert,
	optimisticRemove,
	optimisticUpdate,
} from "@/lib/optimistic";
import type {
	CreateInviteRequest,
	InviteResponse,
	MemberResponse,
	OrgRole,
} from "@/lib/types/org";

const ROLE_BADGE: Record<OrgRole, "default" | "secondary" | "outline"> = {
	owner: "default",
	admin: "secondary",
	member: "outline",
};

const ROLE_LABEL: Record<OrgRole, string> = {
	owner: "Owner",
	admin: "Admin",
	member: "Member",
};

type RemoveTarget = { userId: string; name: string; role: OrgRole };

function SkeletonRow() {
	return (
		<Item variant="outline" className="px-4 py-3.5">
			<Skeleton className="size-8 rounded-full" />
			<ItemContent>
				<ItemTitle className="h-5">
					<Skeleton className="h-4 w-32" />
				</ItemTitle>
				<ItemDescription as="div" className="flex h-5 items-center">
					<Skeleton className="h-3.5 w-44" />
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Skeleton className="h-5 w-14 rounded-4xl" />
			</ItemActions>
		</Item>
	);
}

function MemberListSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-8 w-20" />
			</div>
			<ItemGroup>
				{["a", "b", "c", "d", "e"].map((k) => (
					<SkeletonRow key={k} />
				))}
			</ItemGroup>
			<span className="sr-only">Loading members…</span>
		</div>
	);
}

export function MemberList() {
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const currentUserId = user?.user_id ?? null;

	const {
		data: members,
		isLoading: membersLoading,
		error: membersError,
	} = useMembers(orgId);

	const me = members?.find((m) => m.user_id === currentUserId);
	const canManage = me?.role === "owner" || me?.role === "admin";
	const ownerCount = members?.filter((m) => m.role === "owner").length ?? 0;

	const { data: invites, error: invitesError } = useInvites(orgId, canManage);
	const invitesPending = canManage && invites === undefined && !invitesError;

	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const busy = activeCount > 0;

	const [search, setSearch] = useState("");
	const [inviteOpen, setInviteOpen] = useState(false);
	const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);

	function handleInvite(email: string, role: CreateInviteRequest["role"]) {
		if (!orgId || invites === undefined) return;
		const blocked = new Set([
			...(members ?? []).map((m) => m.email.toLowerCase()),
			...invites
				.filter((i) => i.status !== "expired")
				.map((i) => i.email.toLowerCase()),
		]);
		if (blocked.has(email.toLowerCase())) {
			toast.error("That email is already a member or has a pending invite.");
			return;
		}
		const tempInvite: InviteResponse = {
			id: `optimistic-${Date.now()}`,
			email,
			role,
			invited_by: currentUserId ?? "",
			expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			status: "pending",
		};
		runAction(
			() =>
				optimisticInsert(mutate, invitesKey(orgId), tempInvite, () =>
					createInvite(orgId, email, role),
				),
			{
				toast: {
					success: "Invitation sent",
					error: "Failed to send invitation",
				},
			},
		);
	}

	function handleChangeRole(
		userId: string,
		currentRole: OrgRole,
		newRole: "admin" | "member",
	) {
		if (!orgId || currentRole === newRole) return;
		if (currentRole === "owner" && ownerCount <= 1) {
			toast.error(LAST_OWNER_MSG);
			return;
		}
		runAction(
			() =>
				optimisticUpdate<MemberResponse>(
					mutate,
					membersKey(orgId),
					(m) => (m.user_id === userId ? { ...m, role: newRole } : m),
					() => changeMemberRole(orgId, userId, newRole),
				),
			{ toast: { success: "Role updated", error: "Failed to update role" } },
		);
	}

	function handleRemoveMember(userId: string) {
		if (!orgId) return;
		runAction(
			() =>
				optimisticRemove<MemberResponse>(
					mutate,
					membersKey(orgId),
					(m) => m.user_id === userId,
					() => removeMember(orgId, userId),
				),
			{
				toast: { success: "Member removed", error: "Failed to remove member" },
			},
		);
	}

	function handleLeave(userId: string) {
		if (!orgId) return;
		runAction(
			async () => {
				await removeMember(orgId, userId);
			},
			{ toast: { success: "You left the organization" } },
		)
			.then(() => {
				window.location.href = "/";
			})
			.catch(() => toast.error("Failed to leave the organization"));
	}

	function handleRevokeInvite(inviteId: string) {
		if (!orgId) return;
		runAction(
			() =>
				optimisticRemove<InviteResponse>(
					mutate,
					invitesKey(orgId),
					(i) => i.id === inviteId,
					() => revokeInvite(orgId, inviteId),
				),
			{
				toast: { success: "Invite revoked", error: "Failed to revoke invite" },
			},
		);
	}

	if (membersError) {
		return (
			<DataFetchError
				message={membersError.message}
				onRetry={() => (orgId ? mutate(membersKey(orgId)) : Promise.resolve())}
			/>
		);
	}

	if (!user || (membersLoading && !members) || invitesPending) {
		return <MemberListSkeleton />;
	}

	const q = search.trim().toLowerCase();
	const matches = (name: string, email: string) =>
		!q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q);

	const visibleMembers = (members ?? []).filter((m) =>
		matches(m.name || m.email, m.email),
	);
	const visibleInvites = canManage
		? (invites ?? [])
				.filter((i) => i.status !== "accepted")
				.filter((i) => matches(i.email, i.email))
		: [];

	const removeIsSelf = removeTarget?.userId === currentUserId;
	const removeIsLastOwner = removeTarget?.role === "owner" && ownerCount <= 1;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center gap-2">
				<InputGroup className="max-w-xs">
					<InputGroupAddon align="inline-start">
						<IconSearch />
					</InputGroupAddon>
					<InputGroupInput
						placeholder="Search by name or email"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</InputGroup>
				{canManage && (
					<Button className="ml-auto" onClick={() => setInviteOpen(true)}>
						Invite
					</Button>
				)}
			</div>

			<ItemGroup>
				{visibleMembers.map((member) => {
					const isSelf = member.user_id === currentUserId;
					const isLastOwner = member.role === "owner" && ownerCount <= 1;
					const showMenu = canManage || isSelf;
					return (
						<Item
							key={member.user_id}
							variant="outline"
							className="px-4 py-3.5"
						>
							<MemberAvatar name={member.name} email={member.email} />
							<ItemContent>
								<ItemTitle className="text-base">
									{member.name || member.email}
									{isSelf && (
										<span className="text-xs font-normal text-muted-foreground">
											(You)
										</span>
									)}
								</ItemTitle>
								<ItemDescription className="flex items-center gap-1.5">
									<IconMail className="size-3.5" />
									{member.email}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Badge variant={ROLE_BADGE[member.role]}>
									{ROLE_LABEL[member.role]}
								</Badge>
								{showMenu && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="Open member actions"
												className="focus:ring-0 focus-visible:ring-0"
											>
												<IconDotsVertical />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuGroup>
												{canManage && !isSelf && (
													<DropdownMenuSub>
														<DropdownMenuSubTrigger
															disabled={busy || isLastOwner}
														>
															<IconUserCog />
															Change role
														</DropdownMenuSubTrigger>
														<DropdownMenuSubContent>
															<DropdownMenuRadioGroup
																value={member.role}
																onValueChange={(v) =>
																	handleChangeRole(
																		member.user_id,
																		member.role,
																		v as "admin" | "member",
																	)
																}
															>
																{member.role === "owner" && (
																	<DropdownMenuRadioItem value="owner" disabled>
																		Owner
																	</DropdownMenuRadioItem>
																)}
																<DropdownMenuRadioItem value="admin">
																	Admin
																</DropdownMenuRadioItem>
																<DropdownMenuRadioItem value="member">
																	Member
																</DropdownMenuRadioItem>
															</DropdownMenuRadioGroup>
														</DropdownMenuSubContent>
													</DropdownMenuSub>
												)}
												{isSelf ? (
													<DropdownMenuItem
														variant="destructive"
														disabled={busy || isLastOwner}
														onClick={() =>
															setRemoveTarget({
																userId: member.user_id,
																name: member.name || member.email,
																role: member.role,
															})
														}
													>
														<IconLogout />
														Leave organization
													</DropdownMenuItem>
												) : (
													canManage && (
														<DropdownMenuItem
															variant="destructive"
															disabled={busy || isLastOwner}
															onClick={() =>
																setRemoveTarget({
																	userId: member.user_id,
																	name: member.name || member.email,
																	role: member.role,
																})
															}
														>
															<IconTrash />
															Remove
														</DropdownMenuItem>
													)
												)}
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</ItemActions>
						</Item>
					);
				})}
			</ItemGroup>

			{canManage && visibleInvites.length > 0 && (
				<div className="flex flex-col gap-4">
					<h2 className="text-sm font-medium text-muted-foreground">
						Pending invites
					</h2>
					<ItemGroup>
						{visibleInvites.map((invite) => {
							const isOptimistic = invite.id.startsWith("optimistic-");
							const isExpired = invite.status === "expired";
							return (
								<Item
									key={invite.id}
									variant="outline"
									className={cn("px-4 py-3.5", isOptimistic && "opacity-50")}
								>
									{isOptimistic ? (
										<span className="flex size-8 items-center justify-center">
											<AnimatedSpinner
												name="braille"
												size="1.1em"
												speed={0.8}
											/>
										</span>
									) : (
										<Avatar>
											<AvatarFallback>
												<IconMail className="size-4" />
											</AvatarFallback>
										</Avatar>
									)}
									<ItemContent>
										<ItemTitle className="text-base">{invite.email}</ItemTitle>
										<ItemDescription>
											{isExpired ? "Invite expired" : "Invite pending"}
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<Badge variant={ROLE_BADGE[invite.role]}>
											{ROLE_LABEL[invite.role]}
										</Badge>
										{!isOptimistic && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon-sm"
														aria-label="Open invite actions"
														className="focus:ring-0 focus-visible:ring-0"
													>
														<IconDotsVertical />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuGroup>
														<DropdownMenuItem
															variant="destructive"
															disabled={busy}
															onClick={() => handleRevokeInvite(invite.id)}
														>
															<IconTrash />
															Revoke invite
														</DropdownMenuItem>
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</ItemActions>
								</Item>
							);
						})}
					</ItemGroup>
				</div>
			)}

			{canManage && (
				<InviteMemberDialog
					open={inviteOpen}
					onOpenChange={setInviteOpen}
					onInvite={handleInvite}
				/>
			)}
			<RemoveMemberDialog
				open={!!removeTarget}
				onOpenChange={(open) => {
					if (!open) setRemoveTarget(null);
				}}
				isSelf={removeIsSelf}
				isLastOwner={removeIsLastOwner}
				targetName={removeTarget?.name}
				onConfirm={() => {
					if (!removeTarget || removeIsLastOwner) return;
					if (removeIsSelf) handleLeave(removeTarget.userId);
					else handleRemoveMember(removeTarget.userId);
					setRemoveTarget(null);
				}}
			/>
		</div>
	);
}
