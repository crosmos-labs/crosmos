"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crosmos/ui/components/alert-dialog";
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
import { Kbd } from "@crosmos/ui/components/kbd";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crosmos/ui/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crosmos/ui/components/tooltip";
import { cn } from "@crosmos/ui/lib/utils";
import {
	IconArrowDown,
	IconArrowUp,
	IconCornerDownLeft,
	IconDotsVertical,
	IconLogout,
	IconMail,
	IconTrash,
	IconUserCog,
} from "@tabler/icons-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import {
	changeMemberRole,
	removeMember,
	revokeInvite,
} from "@/actions/members";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { invitesKey } from "@/hooks/use-invites";
import { membersKey } from "@/hooks/use-members";
import {
	avatarColor,
	compareRows,
	getInitials,
	type MemberRow,
	type SortColumn,
	type SortDirection,
	toMemberRows,
} from "@/lib/members";
import { optimisticRemove, optimisticUpdate } from "@/lib/optimistic";
import type { InviteResponse, MemberResponse, OrgRole } from "@/lib/types/org";

const LAST_OWNER_MSG =
	"An organization must always have an owner, so the last owner can't be removed or demoted.";

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

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export interface SortState {
	column: SortColumn;
	direction: SortDirection;
}

function SortableHead({
	column,
	label,
	sort,
	onSort,
	className,
}: {
	column: SortColumn;
	label: string;
	sort: SortState;
	onSort: (column: SortColumn) => void;
	className?: string;
}) {
	const active = sort.column === column;
	return (
		<TableHead
			aria-sort={
				active
					? sort.direction === "asc"
						? "ascending"
						: "descending"
					: "none"
			}
			className={cn("font-normal", className)}
		>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onSort(column)}
				className={cn(
					"-ml-2 h-7 gap-1 px-2 font-normal text-muted-foreground hover:text-foreground",
					active && "text-foreground",
				)}
			>
				{label}
				{active ? (
					sort.direction === "asc" ? (
						<IconArrowUp className="size-3.5" />
					) : (
						<IconArrowDown className="size-3.5" />
					)
				) : (
					<span className="size-3.5" />
				)}
			</Button>
		</TableHead>
	);
}

// Admin-only: shows Pending/Expired for invite rows; "—" for member rows.
function AdminStatusCell({ row }: { row: MemberRow }) {
	if (row.kind === "member")
		return <span className="text-muted-foreground">—</span>;
	const isPending = row.status === "pending";
	const badge = (
		<Badge variant={isPending ? "outline" : "destructive"}>
			{isPending ? "Pending" : "Expired"}
		</Badge>
	);
	if (row.expiresAt) {
		const label = isPending
			? `Expires ${formatDate(row.expiresAt)}`
			: `Expired ${formatDate(row.expiresAt)}`;
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						aria-label={label}
						className="inline-flex cursor-default"
					>
						{badge}
					</button>
				</TooltipTrigger>
				<TooltipContent>{label}</TooltipContent>
			</Tooltip>
		);
	}
	return badge;
}

// Wraps a disabled menu item so the last-owner reason shows on hover (the item
// has pointer-events: none, so the span behind it receives the hover).
function LastOwnerGuard({ children }: { children: React.ReactNode }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span className="block">{children}</span>
			</TooltipTrigger>
			<TooltipContent>{LAST_OWNER_MSG}</TooltipContent>
		</Tooltip>
	);
}

export interface MembersTableProps {
	orgId: string;
	currentUserId: string | null;
	/** true = owner/admin: shows Status column, invites, full actions */
	isAdminView: boolean;
	members: MemberResponse[];
	/** Only provided when isAdminView is true */
	invites?: InviteResponse[];
	ownerCount: number;
	sort: SortState;
	onSortChange: (sort: SortState) => void;
	/** Search query — filtering is applied inside the component */
	search: string;
	/** Status filter — only used in admin view */
	statusFilter: "all" | "active" | "pending" | "expired";
	hasFilters: boolean;
	onClearFilters: () => void;
}

export function MembersTable({
	orgId,
	currentUserId,
	isAdminView,
	members,
	invites,
	ownerCount,
	sort,
	onSortChange,
	search,
	statusFilter,
	hasFilters,
	onClearFilters,
}: MembersTableProps) {
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();

	// Admin view uses the unified MemberRow model (members + invites merged).
	// Member view uses MemberResponse[] mapped to the same shape for uniform rendering.
	const rows: MemberRow[] = useMemo(() => {
		const merged = isAdminView
			? toMemberRows(members, invites ?? [])
			: members.map((m) => ({
					kind: "member" as const,
					id: m.user_id,
					userId: m.user_id,
					name: m.name || m.email,
					email: m.email,
					role: m.role,
					status: "active" as const,
					joinedAt: m.joined_at,
					expiresAt: null,
				}));

		const q = search.trim().toLowerCase();
		const filtered = merged.filter((row) => {
			if (isAdminView && statusFilter !== "all" && row.status !== statusFilter)
				return false;
			if (!q) return true;
			return (
				row.name.toLowerCase().includes(q) ||
				row.email.toLowerCase().includes(q)
			);
		});

		return [...filtered].sort((a, b) =>
			compareRows(a, b, sort.column, sort.direction),
		);
	}, [isAdminView, members, invites, search, statusFilter, sort]);

	// Use a local remove-target keyed by userId for member-view (members only).
	type RemoveTarget = { userId: string; name: string; role: OrgRole };
	const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
	// Preserve the last value so the dialog content doesn't flicker during the close animation.
	const lastRemoveTargetRef = useRef<RemoveTarget | null>(null);
	if (removeTarget !== null) lastRemoveTargetRef.current = removeTarget;
	const displayTarget = removeTarget ?? lastRemoveTargetRef.current;

	const busy = activeCount > 0;

	const handleSort = useCallback(
		(column: SortColumn) => {
			onSortChange({
				column,
				direction:
					sort.column === column
						? sort.direction === "asc"
							? "desc"
							: "asc"
						: "asc",
			});
		},
		[sort, onSortChange],
	);

	const handleChangeRole = useCallback(
		(userId: string, currentRole: OrgRole, newRole: "admin" | "member") => {
			if (currentRole === newRole) return;
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
		},
		[orgId, ownerCount, runAction, mutate],
	);

	const handleRemoveMember = useCallback(
		(userId: string) => {
			runAction(
				() =>
					optimisticRemove<MemberResponse>(
						mutate,
						membersKey(orgId),
						(m) => m.user_id === userId,
						() => removeMember(orgId, userId),
					),
				{
					toast: {
						success: "Member removed",
						error: "Failed to remove member",
					},
				},
			);
		},
		[orgId, runAction, mutate],
	);

	const handleLeave = useCallback(
		(userId: string) => {
			runAction(
				async () => {
					await removeMember(orgId, userId);
				},
				{ toast: { success: "You left the organization" } },
			)
				.then(() => {
					window.location.href = "/";
				})
				.catch(() => {
					toast.error("Failed to leave the organization");
				});
		},
		[orgId, runAction],
	);

	const handleRevokeInvite = useCallback(
		(inviteId: string) => {
			runAction(
				() =>
					optimisticRemove<InviteResponse>(
						mutate,
						invitesKey(orgId),
						(i) => i.id === inviteId,
						() => revokeInvite(orgId, inviteId),
					),
				{
					toast: {
						success: "Invite revoked",
						error: "Failed to revoke invite",
					},
				},
			);
		},
		[orgId, runAction, mutate],
	);

	const removeIsSelf = displayTarget?.userId === currentUserId;
	const removeIsLastOwner = displayTarget?.role === "owner" && ownerCount <= 1;
	// Total column count differs between views (Status only in admin view).
	const colSpan = isAdminView ? 6 : 5;

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<SortableHead
							column="name"
							label="Name"
							sort={sort}
							onSort={handleSort}
						/>
						<SortableHead
							column="email"
							label="Email"
							sort={sort}
							onSort={handleSort}
						/>
						<SortableHead
							column="role"
							label="Role"
							sort={sort}
							onSort={handleSort}
						/>
						{isAdminView && (
							<SortableHead
								column="status"
								label="Status"
								sort={sort}
								onSort={handleSort}
							/>
						)}
						<SortableHead
							column="joined"
							label="Joined"
							sort={sort}
							onSort={handleSort}
						/>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.length === 0 && (
						<TableRow className="hover:bg-transparent">
							<TableCell
								colSpan={colSpan}
								className="h-28 text-center text-muted-foreground"
							>
								<div className="flex flex-col items-center gap-2">
									<span>
										{hasFilters
											? "No members match the current search or filter."
											: "No members yet."}
									</span>
									{hasFilters && (
										<Button
											variant="outline"
											size="sm"
											onClick={onClearFilters}
										>
											Clear filters
										</Button>
									)}
								</div>
							</TableCell>
						</TableRow>
					)}
					{rows.map((row) => {
						const isSelf = row.userId === currentUserId;
						const isLastOwner = row.role === "owner" && ownerCount <= 1;
						const colors = avatarColor(row.email);
						// In-flight invite placeholder (admin view only).
						const isOptimistic =
							isAdminView &&
							row.kind === "invite" &&
							row.id.startsWith("optimistic-");

						return (
							<TableRow
								key={`${row.kind}:${row.id}`}
								className={cn(
									"hover:transition-none",
									isOptimistic && "opacity-50",
								)}
							>
								{/* Name cell */}
								<TableCell>
									<div className="flex items-center gap-3">
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
												<AvatarFallback
													style={row.kind === "member" ? colors : undefined}
												>
													{isAdminView && row.kind === "invite" ? (
														<IconMail className="size-4" />
													) : (
														getInitials(row.name)
													)}
												</AvatarFallback>
											</Avatar>
										)}
										<span className="font-medium text-foreground">
											{row.name}
											{isSelf && (
												<span className="ml-1.5 text-xs font-normal text-muted-foreground">
													(You)
												</span>
											)}
										</span>
									</div>
								</TableCell>

								{/* Email */}
								<TableCell className="text-muted-foreground">
									{row.email}
								</TableCell>

								{/* Role */}
								<TableCell>
									<Badge variant={ROLE_BADGE[row.role]}>
										{ROLE_LABEL[row.role]}
									</Badge>
								</TableCell>

								{/* Status — admin view only */}
								{isAdminView && (
									<TableCell>
										<AdminStatusCell row={row} />
									</TableCell>
								)}

								{/* Joined */}
								<TableCell className="text-muted-foreground">
									{row.joinedAt ? formatDate(row.joinedAt) : "—"}
								</TableCell>

								{/* Actions */}
								<TableCell className="text-right">
									{isAdminView
										? // Admin view: full actions per row
											!isOptimistic && (
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
															{/* Change role — other member rows */}
															{!isSelf && row.kind === "member" && (
																<DropdownMenuSub>
																	<DropdownMenuSubTrigger
																		disabled={busy || isLastOwner}
																	>
																		<IconUserCog />
																		Change role
																	</DropdownMenuSubTrigger>
																	<DropdownMenuSubContent>
																		<DropdownMenuRadioGroup
																			value={row.role}
																			onValueChange={(v) => {
																				if (!row.userId) return;
																				handleChangeRole(
																					row.userId,
																					row.role,
																					v as "admin" | "member",
																				);
																			}}
																		>
																			{row.role === "owner" && (
																				<DropdownMenuRadioItem
																					value="owner"
																					disabled
																				>
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

															{/* Remove — other member rows */}
															{!isSelf &&
																row.kind === "member" &&
																(isLastOwner ? (
																	<LastOwnerGuard>
																		<DropdownMenuItem
																			variant="destructive"
																			disabled
																		>
																			<IconTrash />
																			Remove
																		</DropdownMenuItem>
																	</LastOwnerGuard>
																) : (
																	<DropdownMenuItem
																		variant="destructive"
																		disabled={busy}
																		onClick={() => {
																			if (!row.userId) return;
																			setRemoveTarget({
																				userId: row.userId,
																				name: row.name,
																				role: row.role,
																			});
																		}}
																	>
																		<IconTrash />
																		Remove
																	</DropdownMenuItem>
																))}

															{/* Revoke — invite rows */}
															{row.kind === "invite" && (
																<DropdownMenuItem
																	variant="destructive"
																	disabled={busy}
																	onClick={() => handleRevokeInvite(row.id)}
																>
																	<IconTrash />
																	Revoke invite
																</DropdownMenuItem>
															)}

															{/* Leave — self row */}
															{isSelf &&
																(isLastOwner ? (
																	<LastOwnerGuard>
																		<DropdownMenuItem
																			variant="destructive"
																			disabled
																		>
																			<IconLogout />
																			Leave organization
																		</DropdownMenuItem>
																	</LastOwnerGuard>
																) : (
																	<DropdownMenuItem
																		variant="destructive"
																		disabled={busy}
																		onClick={() => {
																			if (!row.userId) return;
																			setRemoveTarget({
																				userId: row.userId,
																				name: row.name,
																				role: row.role,
																			});
																		}}
																	>
																		<IconLogout />
																		Leave organization
																	</DropdownMenuItem>
																))}
														</DropdownMenuGroup>
													</DropdownMenuContent>
												</DropdownMenu>
											)
										: // Member view: only "Leave organization" on self row
											isSelf && (
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
															<DropdownMenuItem
																variant="destructive"
																disabled={busy}
																onClick={() => {
																	if (!row.userId) return;
																	setRemoveTarget({
																		userId: row.userId,
																		name: row.name,
																		role: row.role,
																	});
																}}
															>
																<IconLogout />
																Leave organization
															</DropdownMenuItem>
														</DropdownMenuGroup>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>

			<AlertDialog
				open={!!removeTarget}
				onOpenChange={(open) => {
					if (!open) setRemoveTarget(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{removeIsSelf ? "Leave organization" : "Remove from organization"}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{removeIsLastOwner
								? LAST_OWNER_MSG
								: removeIsSelf
									? "You'll lose access to this organization and its memory. You can rejoin later only via a new invitation."
									: `${displayTarget?.name ?? "This member"} will lose access to this organization. This can't be undone.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel variant="ghost">
							Cancel <Kbd>Esc</Kbd>
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={removeIsLastOwner}
							onClick={() => {
								if (!removeTarget || removeIsLastOwner) return;
								if (removeIsSelf) {
									handleLeave(removeTarget.userId);
								} else {
									handleRemoveMember(removeTarget.userId);
								}
								setRemoveTarget(null);
							}}
						>
							{removeIsSelf ? "Leave" : "Remove"}{" "}
							<Kbd>
								<IconCornerDownLeft />
							</Kbd>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
