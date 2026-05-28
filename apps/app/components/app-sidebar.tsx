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
import { IconChevronUp, IconLogout } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
import { logout } from "@/actions/auth";
import { OrgSwitcher } from "@/components/org-switcher";
import {
	useActionLoader,
	useActionLoaderState,
} from "@/components/providers/action-loader-provider";
import { externalItems, homeItem, navGroups } from "@/config/nav";
import { clearCache } from "@/hooks/use-clear-cache";
import type { AuthUser } from "@/lib/types/auth";
import type { OrgDetailResponse } from "@/lib/types/org";

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

export function AppSidebar({
	user,
	orgs,
	activeOrg,
}: {
	user: AuthUser;
	orgs: OrgDetailResponse[];
	activeOrg: OrgDetailResponse;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const { runAction } = useActionLoader();
	const { activeCount } = useActionLoaderState();
	const { isMobile, setOpenMobile, state } = useSidebar();

	const dropdownSide = !isMobile && state === "collapsed" ? "right" : "top";

	return (
		<Sidebar collapsible="icon" className="select-none">
			<SidebarHeader>
				<SidebarMenu>
					<OrgSwitcher orgs={orgs} activeOrg={activeOrg} />
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

				{navGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild={!item.disabled}
											isActive={isNavItemActive(pathname, item.href)}
											disabled={item.disabled}
											tooltip={item.disabled ? "Coming soon" : item.label}
											className={cn(
												"pl-4",
												item.disabled &&
													"text-muted-foreground hover:bg-transparent hover:text-muted-foreground active:bg-transparent active:text-muted-foreground data-active:bg-transparent data-active:text-muted-foreground",
											)}
										>
											{item.disabled ? (
												<>
													<item.icon />
													<span>{item.label}</span>
												</>
											) : (
												<Link href={item.href}>
													<item.icon />
													<span>{item.label}</span>
												</Link>
											)}
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
									onClick={() => {
										if (isMobile) setOpenMobile(false);
										runAction(() => logout(), {
											toast: {
												error: "Failed to log out",
											},
										})
											.then(() => clearCache())
											.then(() => router.push("/signup"))
											.catch(() => {
												clearCache();
												router.push("/signup");
											});
									}}
								>
									<IconLogout />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
