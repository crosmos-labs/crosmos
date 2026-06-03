"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crosmos/ui/components/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crosmos/ui/components/tooltip";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { createInvite } from "@/actions/members";
import { DataFetchError } from "@/components/data-fetch-error";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import {
	MembersTable,
	type MembersTableProps,
	type SortState,
} from "@/components/members-table";
import { MembersTableSkeleton } from "@/components/members-table-skeleton";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { invitesKey, useInvites } from "@/hooks/use-invites";
import { membersKey, useMembers } from "@/hooks/use-members";
import { optimisticInsert } from "@/lib/optimistic";
import type { CreateInviteRequest, InviteResponse } from "@/lib/types/org";

type StatusFilter = MembersTableProps["statusFilter"];

export default function SettingsPage() {
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

	// Invites are owner/admin-only — only fetch when the caller can manage.
	const { data: invites, error: invitesError } = useInvites(orgId, canManage);
	// Hold the table until invites resolve too, so members + invites render together.
	const invitesPending = canManage && invites === undefined && !invitesError;
	const invitesReady = !invitesPending;

	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sort, setSort] = useState<SortState>({
		column: "name",
		direction: "asc",
	});
	const [inviteOpen, setInviteOpen] = useState(false);

	const initialLoading =
		!user || (membersLoading && !members) || invitesPending;
	const hasFilters =
		search.trim() !== "" || (canManage && statusFilter !== "all");

	function clearFilters() {
		setSearch("");
		setStatusFilter("all");
	}

	function handleInvite(email: string, role: CreateInviteRequest["role"]) {
		// Guard: invites must be loaded so the duplicate check is reliable.
		if (!invitesReady || !orgId) return;

		const blockedEmails = new Set([
			...(members ?? []).map((m) => m.email.toLowerCase()),
			...(invites ?? [])
				.filter((i) => i.status !== "expired")
				.map((i) => i.email.toLowerCase()),
		]);
		if (blockedEmails.has(email.toLowerCase())) {
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

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage your organization and its members.
				</p>
			</div>

			{membersError ? (
				<DataFetchError
					message={membersError.message}
					onRetry={() =>
						orgId ? mutate(membersKey(orgId)) : Promise.resolve()
					}
				/>
			) : (
				<div className="flex flex-col gap-6">
					<h2 className="text-lg font-semibold tracking-tight">Members</h2>

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

						{/* Status filter — admin view only (invites give it meaning) */}
						{canManage && (
							<Select
								value={statusFilter}
								onValueChange={(v) => setStatusFilter(v as StatusFilter)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
								</SelectContent>
							</Select>
						)}

						{/* Invite button — admin view only */}
						<div className="ml-auto">
							{canManage && invitesReady ? (
								<Button onClick={() => setInviteOpen(true)}>Invite</Button>
							) : canManage ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<span>
											<Button disabled>Invite</Button>
										</span>
									</TooltipTrigger>
									<TooltipContent>Loading invite list…</TooltipContent>
								</Tooltip>
							) : null}
						</div>
					</div>

					{initialLoading ? (
						<MembersTableSkeleton />
					) : (
						<MembersTable
							orgId={orgId ?? ""}
							currentUserId={currentUserId}
							isAdminView={canManage}
							members={members ?? []}
							invites={canManage ? invites : undefined}
							ownerCount={ownerCount}
							sort={sort}
							onSortChange={setSort}
							search={search}
							statusFilter={statusFilter}
							hasFilters={hasFilters}
							onClearFilters={clearFilters}
						/>
					)}
				</div>
			)}

			{canManage && (
				<InviteMemberDialog
					open={inviteOpen}
					onOpenChange={setInviteOpen}
					onInvite={handleInvite}
				/>
			)}
		</div>
	);
}
