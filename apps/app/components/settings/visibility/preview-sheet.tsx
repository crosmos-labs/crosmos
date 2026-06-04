"use client";

import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { Button } from "@crosmos/ui/components/button";
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
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@crosmos/ui/components/sheet";
import { IconChevronDown, IconEye } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useMembers } from "@/hooks/use-members";
import { useVisibilityPreview } from "@/hooks/use-visibility";
import { avatarColor, getInitials } from "@/lib/members";

export function PreviewSheet({
	orgId,
	disabled = false,
}: {
	orgId: string;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [pickerOpen, setPickerOpen] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);

	const { data: orgMembers, isLoading: membersLoading } = useMembers(orgId);
	const { data: preview, isLoading } = useVisibilityPreview(orgId, userId);

	const selected = orgMembers?.find((m) => m.user_id === userId) ?? null;
	const pickerDisabled = disabled || membersLoading || orgMembers === undefined;

	useEffect(() => {
		if (!userId || orgMembers === undefined) return;
		if (orgMembers.some((member) => member.user_id === userId)) return;
		setUserId(null);
		setPickerOpen(false);
	}, [orgMembers, userId]);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" disabled={disabled}>
					<IconEye className="size-4" />
					Preview access
				</Button>
			</SheetTrigger>
			<SheetContent className="gap-0">
				<SheetHeader>
					<SheetTitle>Preview access</SheetTitle>
					<SheetDescription>
						See exactly whose memories a member can read under the current
						rules.
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-4 px-4 pb-4">
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
								className="justify-between"
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

					{userId === null ? (
						<p className="py-8 text-center text-sm text-muted-foreground">
							Pick a member to see their visible scope.
						</p>
					) : isLoading && !preview ? (
						<p className="py-8 text-center text-sm text-muted-foreground">
							Loading…
						</p>
					) : preview ? (
						<div className="flex flex-col gap-3">
							{!preview.visibility_enabled && (
								<p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
									Visibility enforcement is off — this member can currently read
									all org memories. The list below is what they'd see once it's
									on.
								</p>
							)}
							<p className="text-sm text-muted-foreground">
								Can read{" "}
								<span className="font-medium text-foreground">
									{preview.visible_users.length}
								</span>{" "}
								{preview.visible_users.length === 1 ? "member" : "members"}:
							</p>
							<ul className="flex flex-col">
								{preview.visible_users.map((u) => (
									<li key={u.user_id} className="flex items-center gap-3 py-2">
										<Avatar size="sm">
											<AvatarFallback style={avatarColor(u.email)}>
												{getInitials(u.name || u.email)}
											</AvatarFallback>
										</Avatar>
										<div className="flex min-w-0 flex-col">
											<span className="truncate text-sm">
												{u.name || u.email}
												{u.user_id === userId && (
													<span className="text-muted-foreground"> (self)</span>
												)}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{u.email}
											</span>
										</div>
									</li>
								))}
							</ul>
						</div>
					) : null}
				</div>
			</SheetContent>
		</Sheet>
	);
}
