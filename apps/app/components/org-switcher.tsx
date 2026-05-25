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
import { IconCheck, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { OrgAvatar } from "@/components/org-avatar";
import type { OrgDetailResponse } from "@/lib/types/org";

export function OrgSwitcher({
	orgs,
	activeOrg,
}: {
	orgs: OrgDetailResponse[];
	activeOrg: OrgDetailResponse;
}) {
	const { isMobile, state } = useSidebar();
	const dropdownSide = !isMobile && state === "collapsed" ? "right" : "bottom";

	return (
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						size="lg"
						className="group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:pointer-events-auto data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<div className="flex size-8 shrink-0 items-center justify-center">
							<OrgAvatar slug={activeOrg.slug} />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
							<span className="truncate font-medium select-none">
								{activeOrg.name}
							</span>
						</div>
						<IconChevronDown className="ml-auto size-4 overflow-hidden transition-[transform,rotate,max-width,opacity] duration-200 ease-in-out group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side={dropdownSide}
					align="start"
					className="min-w-[16rem]"
				>
					<DropdownMenuGroup>
						{orgs.map((org) => (
							<DropdownMenuItem
								key={org.id}
								disabled
								className="gap-4 py-2.5 px-3"
							>
								<OrgAvatar slug={org.slug} size={20} />
								<div className="flex-1 min-w-0 space-y-0.75">
									<span className="block text-sm font-medium truncate">
										{org.name}
									</span>
									<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
										{org.slug}
										<Badge
											variant="outline"
											className="text-[10px] px-1 py-0 h-4"
										>
											{org.plan}
										</Badge>
									</span>
								</div>
								{org.id === activeOrg.id && (
									<IconCheck className="size-4 shrink-0" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem disabled className="gap-2.5 py-2.5 px-3">
						<IconPlus className="size-4 shrink-0" />
						<span>Create Organization</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
}
