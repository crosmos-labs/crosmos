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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { createInvite } from "@/actions/members";
import { DataFetchError } from "@/components/data-fetch-error";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { MembersTable, type SortState } from "@/components/members-table";
import { MembersTableSkeleton } from "@/components/members-table-skeleton";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { useCurrentUser } from "@/hooks/use-current-user";
import { invitesKey, useInvites } from "@/hooks/use-invites";
import { membersKey, useMembers } from "@/hooks/use-members";
import { sortRows, toMemberRows } from "@/lib/members";
import { MOCK_INVITES, mockMembers } from "@/lib/mock-members";
import type { CreateInviteRequest, InviteResponse } from "@/lib/types/org";

type StatusFilter = "all" | "active" | "pending" | "expired";

// TEMP: serve mock data when the backend returns nothing. Remove this flag and
// the related fallbacks (and lib/mock-members.ts) once the API is live.
const USE_MOCK_DATA = true;

export default function SettingsPage() {
	const { data: user } = useCurrentUser();
	const orgId = user?.active_org_id ?? null;
	const currentUserId = user?.user_id ?? null;

	const {
		data: fetchedMembers,
		isLoading: membersLoading,
		error: membersError,
	} = useMembers(orgId);

	// TEMP: fall back to mock data until the members API is live.
	const mockedMembers = useMemo(
		() =>
			mockMembers({
				userId: currentUserId,
				email: user?.email,
				name: user?.name,
			}),
		[currentUserId, user?.email, user?.name],
	);
	const members = fetchedMembers ?? (USE_MOCK_DATA ? mockedMembers : undefined);

	// TEMP: treat the viewer as a manager while running on mock data.
	const usingMockMembers = USE_MOCK_DATA && !fetchedMembers;
	const selfUserId = currentUserId ?? (usingMockMembers ? "mock-self" : null);
	const me = members?.find((m) => m.user_id === selfUserId);
	const canManage =
		me?.role === "owner" || me?.role === "admin" || usingMockMembers;
	const ownerCount = members?.filter((m) => m.role === "owner").length ?? 0;

	// Invites are owner/admin-only on the backend — only fetch when we can manage.
	const { data: fetchedInvites } = useInvites(orgId, canManage);
	// TEMP: locally-added invites while running on mock data.
	const [mockInvites, setMockInvites] = useState<InviteResponse[]>([]);
	const invites =
		fetchedInvites ??
		(USE_MOCK_DATA ? [...mockInvites, ...MOCK_INVITES] : undefined);

	// TEMP: keep the table mounted under mock data even without a real org id.
	const effectiveOrgId = orgId ?? (USE_MOCK_DATA ? "mock-org" : null);

	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sort, setSort] = useState<SortState>({
		column: "name",
		direction: "asc",
	});
	const [inviteOpen, setInviteOpen] = useState(false);

	const allRows = useMemo(
		() => toMemberRows(members ?? [], invites ?? []),
		[members, invites],
	);

	const visibleRows = useMemo(() => {
		const q = search.trim().toLowerCase();
		const filtered = allRows.filter((row) => {
			if (statusFilter !== "all" && row.status !== statusFilter) return false;
			if (!q) return true;
			return (
				row.name.toLowerCase().includes(q) ||
				row.email.toLowerCase().includes(q)
			);
		});
		return sortRows(filtered, sort.column, sort.direction);
	}, [allRows, search, statusFilter, sort]);

	const hasFilters = search.trim() !== "" || statusFilter !== "all";
	const initialLoading = !user || (membersLoading && !members);

	function clearFilters() {
		setSearch("");
		setStatusFilter("all");
	}

	function handleInvite(email: string, role: CreateInviteRequest["role"]) {
		const exists = allRows.some(
			(r) =>
				r.status !== "expired" && r.email.toLowerCase() === email.toLowerCase(),
		);
		if (exists) {
			toast.error("That email is already a member or has a pending invite.");
			return;
		}
		// TEMP: without a real org id we append to the local mock invite list.
		// Optimistically add the row, then run a delayed action so the loading
		// state is visible (and rolled back if the simulated request "fails").
		if (USE_MOCK_DATA && !orgId) {
			const optimisticInvite: InviteResponse = {
				id: `mock-invite-${Date.now()}`,
				email,
				role,
				invited_by: currentUserId ?? "mock-self",
				expires_at: new Date(
					Date.now() + 7 * 24 * 60 * 60 * 1000,
				).toISOString(),
				status: "pending",
			};
			setMockInvites((prev) => [optimisticInvite, ...prev]);
			runAction(
				async () => {
					// Simulate network latency so the optimistic update + loader show.
					await new Promise((resolve) => setTimeout(resolve, 1200));
				},
				{
					toast: {
						success: "Invitation sent",
						error: "Failed to send invitation",
					},
				},
			).catch(() => {
				// Roll back the optimistic row on a simulated failure.
				setMockInvites((prev) =>
					prev.filter((i) => i.id !== optimisticInvite.id),
				);
			});
			return;
		}
		if (!orgId) return;
		runAction(
			async () => {
				await mutate(
					invitesKey(orgId),
					async (current: InviteResponse[] | undefined) => {
						const invite = await createInvite(orgId, email, role);
						return [invite, ...(current ?? [])];
					},
					{ revalidate: false },
				);
			},
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

			{membersError && !USE_MOCK_DATA ? (
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
						<div className="ml-auto">
							{canManage ? (
								<Button onClick={() => setInviteOpen(true)}>Invite</Button>
							) : (
								<Tooltip>
									<TooltipTrigger asChild>
										<span>
											<Button disabled>Invite</Button>
										</span>
									</TooltipTrigger>
									<TooltipContent>
										Only owners and admins can invite members.
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					</div>

					{initialLoading ? (
						<MembersTableSkeleton />
					) : effectiveOrgId ? (
						<MembersTable
							orgId={effectiveOrgId}
							currentUserId={selfUserId}
							canManage={canManage}
							rows={visibleRows}
							ownerCount={ownerCount}
							sort={sort}
							onSortChange={setSort}
							hasFilters={hasFilters}
							onClearFilters={clearFilters}
						/>
					) : null}
				</div>
			)}

			<InviteMemberDialog
				open={inviteOpen}
				onOpenChange={setInviteOpen}
				onInvite={handleInvite}
			/>
		</div>
	);
}
