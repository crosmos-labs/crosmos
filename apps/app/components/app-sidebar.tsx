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
import { IconBuilding, IconChevronDown, IconLogout } from "@tabler/icons-react";
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
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { externalItems, homeItem, navGroups } from "@/config/nav";
import type { AuthUser } from "@/lib/types/auth";

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function AppSidebar({ user }: { user: AuthUser }) {
	const pathname = usePathname();
	const router = useRouter();
	const { runAction } = useActionLoader();
	const { isMobile, setOpenMobile, state } = useSidebar();

	const dropdownSide = !isMobile && state === "collapsed" ? "right" : "top";

	return (
		<Sidebar collapsible="icon" className="select-none">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
								<IconBuilding className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium select-none">
									Default Organisation
								</span>
							</div>
							<IconChevronDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={pathname === homeItem.href}
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
											isActive={pathname === item.href}
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
									<span className="inline-flex items-center gap-2">
										<item.icon />
										<span>{item.label}</span>
									</span>
									<LinkArrow className="ml-auto" />
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
									tooltip={
										state === "collapsed" && !isMobile ? undefined : user.name
									}
									className="group data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="size-8">
										<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate">{user.name}</span>
										<span className="truncate text-xs text-muted-foreground">
											{user.email}
										</span>
									</div>
									<IconChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								side={dropdownSide}
								align="end"
								className="w-(--radix-dropdown-menu-trigger-width)"
							>
								<DropdownMenuItem
									onClick={() => {
										if (isMobile) setOpenMobile(false);
										runAction(() => logout(), {
											toast: {
												error: "Failed to log out",
											},
										})
											.then(() => router.push("/signup"))
											.catch(() => {});
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
