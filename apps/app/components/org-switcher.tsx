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
import {
	IconCheck,
	IconChevronDown,
	IconPlus,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { setActiveOrg } from "@/actions/orgs";
import { OrgAvatar } from "@/components/org-avatar";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import type { OrgDetailResponse } from "@/lib/types/org";

export function OrgSwitcher({
	orgs,
	activeOrg,
}: {
	orgs: OrgDetailResponse[];
	activeOrg: OrgDetailResponse;
}) {
	const router = useRouter();
	const { runAction } = useActionLoader();
	const { isMobile, state } = useSidebar();
	const dropdownSide = !isMobile && state === "collapsed" ? "right" : "bottom";

	function handleSwitchOrg(orgId: number) {
		if (orgId === activeOrg.id) return;
		runAction(() => setActiveOrg(orgId), {
			toast: { error: "Failed to switch organization" },
		}).then(() => router.refresh());
	}

	const mockOrgs: OrgDetailResponse[] = [
		...orgs,
		{
			id: 999,
			slug: "acme-corp",
			name: "Acme Corp",
			plan: "pro",
			billing_email: "billing@acme.com",
			member_count: 5,
			your_role: "admin",
			created_at: "2026-01-15T00:00:00Z",
			updated_at: "2026-04-01T00:00:00Z",
		},
		{
			id: 1000,
			slug: "starter-team",
			name: "Starter Team",
			plan: "starter",
			billing_email: null,
			member_count: 2,
			your_role: "member",
			created_at: "2026-03-10T00:00:00Z",
			updated_at: "2026-03-10T00:00:00Z",
		},
	];

	return (
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						size="lg"
						className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
					>
						<OrgAvatar slug={activeOrg.slug} />
						<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
							<span className="truncate font-medium select-none">
								{activeOrg.name}
							</span>
						</div>
						<IconChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side={dropdownSide}
					align="start"
					className="min-w-[16rem]"
				>
					<DropdownMenuGroup>
						{mockOrgs.map((org) => (
							<DropdownMenuItem
								key={org.id}
								onClick={() => handleSwitchOrg(org.id)}
								className="gap-2.5 py-2.5 px-3"
							>
								<OrgAvatar slug={org.slug} className="size-5" />
								<div className="flex-1 min-w-0">
									<span className="block text-sm font-medium truncate">
										{org.name}
									</span>
									<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
										{org.slug}
										<Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
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