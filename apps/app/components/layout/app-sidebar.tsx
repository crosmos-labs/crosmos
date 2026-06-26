"use client";

import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crosmos/ui/components/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@crosmos/ui/components/sidebar";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { IconChevronUp, IconLogout } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { preload } from "swr";

function LinkArrow({ className }: { className?: string }) {
	return (
		<svg
			className={cn("size-4 -rotate-45", className)}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<title>Arrow Right</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M13 7l5 5m0 0l-5 5m5-5H6"
			/>
		</svg>
	);
}

import { cn } from "@crosmos/ui/lib/utils";
import { listApiKeys } from "@/actions/api-keys";
import { logout } from "@/actions/auth";
import { listSpaces } from "@/actions/spaces";
import { getUsage } from "@/actions/usage";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import { useActionLoaderState } from "@/components/providers/action-loader-provider";
import { externalItems, homeItem, type NavItem, navGroups } from "@/config/nav";
import { apiKeysKey } from "@/hooks/use-api-keys";
import { useCurrentUser } from "@/hooks/use-current-user";
import { spacesKey } from "@/hooks/use-spaces";
import { usageKey } from "@/hooks/use-usage";

function isNavItemActive(pathname: string, href: string) {
	// Home matches only its exact path; every other item also matches its
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

// Warm a route's SWR cache on hover/focus so the data is in flight before the
// click lands. Only the cheap, org-only reads are warmed; sources/graph also
// depend on the spaces list, which this primes.
function warmRoute(href: string, orgId: string | null) {
	if (!orgId) return;
	if (href === "/spaces" || href === "/sources" || href === "/graph") {
		preload(spacesKey(orgId), () => listSpaces());
	} else if (href === "/api-key") {
		preload(apiKeysKey(orgId), () => listApiKeys());
	} else if (href === "/billing") {
		preload(usageKey(orgId), () => getUsage());
	}
}

export function AppSidebar() {
	const pathname = usePathname();
	const { data: user } = useCurrentUser();
	const activeOrg = user?.active_org ?? null;
	const orgId = user?.active_org_id ?? null;
	const { activeCount } = useActionLoaderState();
	const { isMobile, setOpenMobile, state } = useSidebar();

	const dropdownSide = !isMobile && state === "collapsed" ? "right" : "top";

	const isItemVisible = (item: NavItem) =>
		!item.hidden &&
		!item.disabled &&
		(!item.roles ||
			(activeOrg ? item.roles.includes(activeOrg.your_role) : false));

	const visibleGroups = navGroups.filter((group) =>
		group.items.some(isItemVisible),
	);

	return (
		<Sidebar collapsible="icon" className="select-none">
			<SidebarHeader>
				<SidebarMenu>
					{activeOrg ? (
						<OrgSwitcher activeOrg={activeOrg} />
					) : (
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" disabled>
								<Skeleton className="size-8 shrink-0 rounded-md" />
								<Skeleton className="h-4 flex-1 group-data-[collapsible=icon]:hidden" />
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={isNavItemActive(pathname, homeItem.href)}
									tooltip={homeItem.label}
									className="pl-4"
								>
									<Link href={homeItem.href}>
										<homeItem.icon />
										<span>{homeItem.label}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{visibleGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu className="gap-px">
								{group.items.filter(isItemVisible).map((item) => (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={isNavItemActive(pathname, item.href)}
											tooltip={item.label}
											className="pl-4 hover:transition-none"
										>
											<Link
												href={item.href}
												onMouseEnter={() => warmRoute(item.href, orgId)}
												onFocus={() => warmRoute(item.href, orgId)}
											>
												<item.icon />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu className="gap-2">
					{externalItems.map((item) => (
						<SidebarMenuItem key={item.href}>
							<SidebarMenuButton
								asChild
								tooltip={item.label}
								className="pl-4 opacity-80 hover:opacity-100 hover:bg-transparent active:bg-transparent"
							>
								<a href={item.href} target="_blank" rel="noopener noreferrer">
									<item.icon />
									<span className="overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
										{item.label}
									</span>
									<LinkArrow className="ml-auto overflow-hidden transition-[max-width,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0" />
								</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
				<SidebarMenu>
					<SidebarMenuItem>
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										tooltip={user.name}
										className="group data-[state=open]:pointer-events-auto data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<Avatar className="size-8">
											<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
											<span className="truncate">{user.name}</span>
											<span className="truncate text-xs text-muted-foreground">
												{user.email}
											</span>
										</div>
										<IconChevronUp className="ml-auto size-4 overflow-hidden transition-[transform,rotate,max-width,opacity] duration-200 ease-in-out group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									side={dropdownSide}
									align="end"
									className="w-(--radix-dropdown-menu-trigger-width)"
								>
									<DropdownMenuItem
										disabled={activeCount > 0}
										onSelect={async () => {
											if (isMobile) setOpenMobile(false);
											await logout();
											window.location.href = "/signup";
										}}
									>
										<IconLogout />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<SidebarMenuButton size="lg" disabled>
								<Skeleton className="size-8 shrink-0 rounded-full" />
								<div className="grid flex-1 gap-1 group-data-[collapsible=icon]:hidden">
									<Skeleton className="h-3.5 w-24" />
									<Skeleton className="h-3 w-32" />
								</div>
							</SidebarMenuButton>
						)}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
