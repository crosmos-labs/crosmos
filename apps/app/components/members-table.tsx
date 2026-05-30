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
import { useCallback, useState } from "react";
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
	getInitials,
	type MemberRow,
	type RowStatus,
	type SortColumn,
	type SortDirection,
} from "@/lib/members";
import type { InviteResponse, MemberResponse, OrgRole } from "@/lib/types/org";

const LAST_OWNER_MSG =
	"This is the last owner. Transfer ownership to someone else first.";

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

const STATUS_BADGE: Record<RowStatus, "secondary" | "outline" | "destructive"> =
	{
		active: "secondary",
		pending: "outline",
		expired: "destructive",
	};

const STATUS_LABEL: Record<RowStatus, string> = {
	active: "Active",
	pending: "Pending",
	expired: "Expired",
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

function StatusCell({ row }: { row: MemberRow }) {
	const badge = (
		<Badge variant={STATUS_BADGE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
	);
	if (row.kind === "invite" && row.expiresAt) {
		const label =
			row.status === "expired"
				? `Expired ${formatDate(row.expiresAt)}`
				: `Expires ${formatDate(row.expiresAt)}`;
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

interface MembersTableProps {
	orgId: string;
	currentUserId: string | null;
	canManage: boolean;
	rows: MemberRow[];
	ownerCount: number;
	sort: SortState;
	onSortChange: (sort: SortState) => void;
	hasFilters: boolean;
	onClearFilters: () => void;
}

export function MembersTable({
	orgId,
	currentUserId,
	canManage,
	rows,
	ownerCount,
	sort,
	onSortChange,
	hasFilters,
	onClearFilters,
}: MembersTableProps) {
	const { mutate } = useSWRConfig();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const [removeTarget, setRemoveTarget] = useState<MemberRow | null>(null);

	const busy = activeCount > 0;

	const handleSort = useCallback(
		(column: SortColumn) => {
			if (sort.column === column) {
				onSortChange({
					column,
					direction: sort.direction === "asc" ? "desc" : "asc",
				});
			} else {
				onSortChange({ column, direction: "asc" });
			}
		},
		[sort, onSortChange],
	);

	const handleChangeRole = useCallback(
		(row: MemberRow, newRole: "admin" | "member") => {
			if (!row.userId || row.role === newRole) return;
			if (row.role === "owner" && ownerCount <= 1) {
				toast.error(LAST_OWNER_MSG);
				return;
			}
			const userId = row.userId;
			runAction(
				async () => {
					await mutate(
						membersKey(orgId),
						async (current: MemberResponse[] | undefined) => {
							await changeMemberRole(orgId, userId, newRole);
							return (current ?? []).map((m) =>
								m.user_id === userId ? { ...m, role: newRole } : m,
							);
						},
						{
							optimisticData: (current: MemberResponse[] | undefined) =>
								(current ?? []).map((m) =>
									m.user_id === userId ? { ...m, role: newRole } : m,
								),
							rollbackOnError: true,
							revalidate: false,
						},
					);
				},
				{ toast: { success: "Role updated", error: "Failed to update role" } },
			);
		},
		[orgId, ownerCount, runAction, mutate],
	);

	const handleRemoveMember = useCallback(
		(row: MemberRow) => {
			if (!row.userId) return;
			const userId = row.userId;
			runAction(
				async () => {
					await mutate(
						membersKey(orgId),
						async (current: MemberResponse[] | undefined) => {
							await removeMember(orgId, userId);
							return (current ?? []).filter((m) => m.user_id !== userId);
						},
						{
							optimisticData: (current: MemberResponse[] | undefined) =>
								(current ?? []).filter((m) => m.user_id !== userId),
							rollbackOnError: true,
							revalidate: false,
						},
					);
				},
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
		(row: MemberRow) => {
			if (!row.userId) return;
			const userId = row.userId;
			runAction(
				async () => {
					await removeMember(orgId, userId);
				},
				{ toast: { success: "You left the organization" } },
			)
				.then(() => {
					// We no longer belong to an org — let the dashboard layout re-route.
					window.location.href = "/";
				})
				.catch(() => {
					toast.error("Failed to leave the organization");
				});
		},
		[orgId, runAction],
	);

	const handleRevokeInvite = useCallback(
		(row: MemberRow) => {
			const inviteId = row.id;
			runAction(
				async () => {
					await mutate(
						invitesKey(orgId),
						async (current: InviteResponse[] | undefined) => {
							await revokeInvite(orgId, inviteId);
							return (current ?? []).filter((i) => i.id !== inviteId);
						},
						{
							optimisticData: (current: InviteResponse[] | undefined) =>
								(current ?? []).filter((i) => i.id !== inviteId),
							rollbackOnError: true,
							revalidate: false,
						},
					);
				},
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

	const removeIsSelf = removeTarget?.userId === currentUserId;
	const removeIsLastOwner = removeTarget?.role === "owner" && ownerCount <= 1;

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
						<SortableHead
							column="status"
							label="Status"
							sort={sort}
							onSort={handleSort}
						/>
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
								colSpan={6}
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
						const isSelf =
							row.kind === "member" && row.userId === currentUserId;
						const isLastOwner = row.role === "owner" && ownerCount <= 1;
						const colors = avatarColor(row.email);

						// Which actions are available for this row?
						const canLeave = isSelf;
						const canManageOther =
							!isSelf && canManage && row.kind === "member";
						const canRevoke = canManage && row.kind === "invite";
						const hasActions = canLeave || canManageOther || canRevoke;

						return (
							<TableRow key={`${row.kind}:${row.id}`}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar>
											<AvatarFallback
												style={row.kind === "member" ? colors : undefined}
											>
												{row.kind === "invite" ? (
													<IconMail className="size-4" />
												) : (
													getInitials(row.name)
												)}
											</AvatarFallback>
										</Avatar>
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
								<TableCell className="text-muted-foreground">
									{row.email}
								</TableCell>
								<TableCell>
									<Badge variant={ROLE_BADGE[row.role]}>
										{ROLE_LABEL[row.role]}
									</Badge>
								</TableCell>
								<TableCell>
									<StatusCell row={row} />
								</TableCell>
								<TableCell className="text-muted-foreground">
									{row.joinedAt ? formatDate(row.joinedAt) : "—"}
								</TableCell>
								<TableCell className="text-right">
									{hasActions && (
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
													{canManageOther && (
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
																	onValueChange={(v) =>
																		handleChangeRole(
																			row,
																			v as "admin" | "member",
																		)
																	}
																>
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
													{canManageOther && (
														<DropdownMenuItem
															variant="destructive"
															disabled={busy}
															onClick={() => setRemoveTarget(row)}
														>
															<IconTrash />
															Remove
														</DropdownMenuItem>
													)}
													{canRevoke && (
														<DropdownMenuItem
															variant="destructive"
															disabled={busy}
															onClick={() => handleRevokeInvite(row)}
														>
															<IconTrash />
															Revoke invite
														</DropdownMenuItem>
													)}
													{canLeave && (
														<DropdownMenuItem
															variant="destructive"
															disabled={busy}
															onClick={() => setRemoveTarget(row)}
														>
															<IconLogout />
															Leave organization
														</DropdownMenuItem>
													)}
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
									: `${removeTarget?.name ?? "This member"} will lose access to this organization. This can't be undone.`}
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
									handleLeave(removeTarget);
								} else {
									handleRemoveMember(removeTarget);
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
