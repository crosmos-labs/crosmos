"use client";

import { usePathname } from "next/navigation";
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
} from "@crosmos/ui/components/sidebar";
import { Avatar, AvatarFallback } from "@crosmos/ui/components/avatar";
import { IconBuilding, IconChevronDown } from "@tabler/icons-react";

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
import type { AuthUser } from "@/lib/auth/types";
import { homeItem, navGroups, externalItems } from "@/config/nav";

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

	return (
		<Sidebar collapsible="icon">
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
								<span className="truncate font-medium">
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
									<a href={homeItem.href}>
										<homeItem.icon />
										<span>{homeItem.label}</span>
									</a>
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
											asChild={item.disabled ? false : true}
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
												<a href={item.href}>
													<item.icon />
													<span>{item.label}</span>
												</a>
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
								className="pl-4 hover:bg-transparent active:bg-transparent"
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
						<SidebarMenuButton size="lg" tooltip={user.name}>
							<Avatar className="size-8">
								<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate">{user.name}</span>
								<span className="truncate text-xs text-muted-foreground">
									{user.email}
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
