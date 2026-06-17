"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@crosmos/ui/components/alert";
import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { Button } from "@crosmos/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crosmos/ui/components/card";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crosmos/ui/components/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crosmos/ui/components/popover";
import { ScrollArea } from "@crosmos/ui/components/scroll-area";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { IconChevronDown, IconEye, IconShieldLock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useMembers } from "@/hooks/use-members";
import { useVisibilityPreview } from "@/hooks/use-visibility";
import { avatarColor, getInitials } from "@/lib/members";

export function MemberPreview({
	orgId,
	disabled = false,
}: {
	orgId: string;
	disabled?: boolean;
}) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);

	const {
		data: orgMembers,
		isLoading: membersLoading,
		error: membersError,
	} = useMembers(orgId);
	const {
		data: preview,
		isLoading,
		error: previewError,
	} = useVisibilityPreview(orgId, userId);

	const selected = orgMembers?.find((m) => m.user_id === userId) ?? null;
	const pickerDisabled =
		disabled || membersLoading || !!membersError || orgMembers === undefined;

	// Drop a stale selection if the member list changes underneath us.
	useEffect(() => {
		if (!userId || orgMembers === undefined) return;
		if (orgMembers.some((member) => member.user_id === userId)) return;
		setUserId(null);
		setPickerOpen(false);
	}, [orgMembers, userId]);

	return (
		<Card size="sm" className="bg-card/40">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-sm">
					<IconEye className="size-4 text-muted-foreground" />
					Inspect a member
				</CardTitle>
			</CardHeader>

			<CardContent className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center gap-3">
					<Popover
						open={pickerOpen}
						onOpenChange={(nextOpen) => {
							if (pickerDisabled) return;
							setPickerOpen(nextOpen);
						}}
					>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="min-w-44 justify-between"
								disabled={pickerDisabled}
							>
								<span className="truncate">
									{selected
										? selected.name || selected.email
										: "Select a member"}
								</span>
								<IconChevronDown className="size-4 text-muted-foreground" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="p-0" align="start">
							<Command>
								<CommandInput placeholder="Search members…" />
								<CommandList>
									<CommandEmpty>No members.</CommandEmpty>
									{(orgMembers ?? []).map((m) => (
										<CommandItem
											key={m.user_id}
											value={`${m.name} ${m.email}`}
											disabled={pickerDisabled}
											onSelect={() => {
												if (pickerDisabled) return;
												setUserId(m.user_id);
												setPickerOpen(false);
											}}
										>
											<Avatar size="sm">
												<AvatarFallback style={avatarColor(m.email)}>
													{getInitials(m.name || m.email)}
												</AvatarFallback>
											</Avatar>
											<span className="truncate text-sm">
												{m.name || m.email}
											</span>
										</CommandItem>
									))}
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					{userId !== null && preview && !previewError && (
						<span className="text-sm text-muted-foreground">
							sees{" "}
							<span className="font-medium text-foreground">
								{preview.visible_users.length}
							</span>{" "}
							{preview.visible_users.length === 1 ? "owner" : "owners"}
						</span>
					)}
				</div>
				{membersError ? (
					<p className="text-sm text-muted-foreground">
						Failed to load members. Refresh to try again.
					</p>
				) : userId === null ? (
					<p className="text-sm text-muted-foreground">
						Pick a member to see which private memory owners are visible to
						them.
					</p>
				) : previewError ? (
					<p className="text-sm text-muted-foreground">
						Failed to load preview. Refresh to try again.
					</p>
				) : isLoading && !preview ? (
					<div className="flex flex-col gap-3 rounded-md border p-1">
						{["a", "b", "c"].map((k) => (
							<div key={k} className="flex items-center gap-3 px-2 py-1">
								<Skeleton className="size-7 shrink-0 rounded-full" />
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-3.5 w-32" />
									<Skeleton className="h-3 w-44" />
								</div>
							</div>
						))}
					</div>
				) : preview ? (
					<div className="flex flex-col gap-3">
						{!preview.visibility_enabled && (
							<Alert>
								<IconShieldLock />
								<AlertTitle>Group access rules are paused</AlertTitle>
								<AlertDescription>
									This member currently reads their own private memories plus
									org-shared content. The list below is the grant-derived
									private owner scope when rules are activated.
								</AlertDescription>
							</Alert>
						)}
						{preview.visible_users.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No other members' private memories are visible to this member.
							</p>
						) : (
							<ScrollArea className="max-h-56 rounded-md border">
								<ul className="flex flex-col p-1">
									{preview.visible_users.map((u) => (
										<li
											key={u.user_id}
											className="flex items-center gap-3 rounded-md px-2 py-2"
										>
											<Avatar size="sm">
												<AvatarFallback style={avatarColor(u.email)}>
													{getInitials(u.name || u.email)}
												</AvatarFallback>
											</Avatar>
											<div className="flex min-w-0 flex-col">
												<span className="truncate text-sm">
													{u.name || u.email}
													{u.user_id === userId && (
														<span className="text-muted-foreground">
															{" "}
															(self)
														</span>
													)}
												</span>
												<span className="truncate text-xs text-muted-foreground">
													{u.email}
												</span>
											</div>
										</li>
									))}
								</ul>
							</ScrollArea>
						)}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
