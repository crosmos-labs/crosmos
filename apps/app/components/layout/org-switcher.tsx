"use client";

import { Badge } from "@crosmos/ui/components/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import {
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@crosmos/ui/components/sidebar";
import { cn } from "@crosmos/ui/lib/utils";
import { IconCheck, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { setActiveOrg } from "@/actions/auth";
import { OrgAvatar } from "@/components/layout/org-avatar";
import { orgsKey, useOrgs } from "@/hooks/use-orgs";
import { getOrgSwitchFallbackPath } from "@/lib/org-switch-routes";
import type { ActiveOrgSummary, OrgDetailResponse } from "@/lib/types/org";

function hasPlan(
	org: ActiveOrgSummary | OrgDetailResponse,
): org is OrgDetailResponse {
	return "plan" in org;
}

export function OrgSwitcher({ activeOrg }: { activeOrg: ActiveOrgSummary }) {
	const { isMobile, state } = useSidebar();
	const dropdownSide = !isMobile && state === "collapsed" ? "right" : "bottom";
	const router = useRouter();
	const pathname = usePathname();
	const { mutate } = useSWRConfig();
	const { data: orgs, error: orgsError, isLoading: orgsLoading } = useOrgs();
	const [open, setOpen] = useState(false);
	const [switchingId, setSwitchingId] = useState<string | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const pointerSelectionRef = useRef(false);

	// The switch completes once the server re-renders with the new active org.
	// Clear the in-progress state when that new activeOrg prop arrives (adjusting
	// state during render — no effect needed).
	const [seenActiveId, setSeenActiveId] = useState(activeOrg.id);
	if (seenActiveId !== activeOrg.id) {
		setSeenActiveId(activeOrg.id);
		if (switchingId) setSwitchingId(null);
	}

	async function handleSwitch(orgId: string) {
		if (orgId === activeOrg.id || switchingId) return;
		setOpen(false);
		setSwitchingId(orgId);
		try {
			await setActiveOrg(orgId);
			// Refresh the client-side auth cache under the newly minted token.
			// Org-scoped data keys include active_org_id, so they update when this lands.
			await mutate("/auth/me");
			await mutate(orgsKey);
			const fallbackPath = getOrgSwitchFallbackPath(pathname);
			if (fallbackPath) {
				router.replace(fallbackPath);
			} else {
				router.refresh();
			}
		} catch {
			setSwitchingId(null);
			toast.error("Couldn't switch organization");
			router.refresh();
		}
	}

	const switching = switchingId !== null;
	const currentActiveOrg =
		orgs?.find((org) => org.id === activeOrg.id) ?? activeOrg;
	// Optimistically show the target org in the trigger the moment it's clicked,
	// muted until the switch lands (real activeOrg catches up).
	const displayOrg = switchingId
		? (orgs?.find((o) => o.id === switchingId) ?? currentActiveOrg)
		: currentActiveOrg;
	const orgItems = orgs ?? [currentActiveOrg];
	const orgListUnavailable = Boolean(orgsError);
	const canSelectOrgs = !switching && !orgsLoading && !orgListUnavailable;

	return (
		<SidebarMenuItem>
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						ref={triggerRef}
						size="lg"
						className="group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:pointer-events-auto data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<div
							className={cn(
								"flex size-8 shrink-0 items-center justify-center transition-opacity",
								switching && "opacity-50",
							)}
						>
							<OrgAvatar slug={displayOrg.slug} />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
							<span
								className={cn(
									"truncate font-medium select-none transition-opacity",
									switching && "opacity-50",
								)}
							>
								{displayOrg.name}
							</span>
						</div>
						<IconChevronDown className="ml-auto size-4 overflow-hidden transition-[transform,rotate,max-width,opacity] duration-200 ease-in-out group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side={dropdownSide}
					align="start"
					className="min-w-[16rem]"
					onCloseAutoFocus={(event) => {
						if (!pointerSelectionRef.current) return;

						event.preventDefault();
						pointerSelectionRef.current = false;
						requestAnimationFrame(() => {
							triggerRef.current?.blur();
						});
					}}
				>
					<DropdownMenuGroup>
						{orgItems.map((org) => {
							// The selection follows the optimistic target while switching.
							const isSelected = org.id === (switchingId ?? activeOrg.id);
							const isSwitching = switchingId === org.id;
							return (
								<DropdownMenuItem
									key={org.id}
									disabled={!canSelectOrgs}
									onPointerDown={() => {
										pointerSelectionRef.current = true;
									}}
									onSelect={() => {
										handleSwitch(org.id);
									}}
									className={cn(
										"gap-4 py-2.5 px-3 cursor-pointer transition-colors hover:transition-none",
										isSwitching && "opacity-50",
									)}
								>
									<OrgAvatar slug={org.slug} size={20} />
									<div className="flex-1 min-w-0 space-y-0.75">
										<span className="block text-sm font-medium truncate">
											{org.name}
										</span>
										<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
											{org.slug}
											{hasPlan(org) && (
												<Badge
													variant="outline"
													className="text-[10px] px-1 py-0 h-4"
												>
													{org.plan}
												</Badge>
											)}
										</span>
									</div>
									{isSelected && <IconCheck className="size-4 shrink-0" />}
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuGroup>
					{orgListUnavailable && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem disabled className="py-2.5 px-3 text-xs">
								Couldn't load organizations
							</DropdownMenuItem>
						</>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						disabled
						className="gap-2.5 py-2.5 px-3 cursor-pointer"
					>
						<IconPlus className="size-4 shrink-0" />
						<span>Create Organization</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
}
