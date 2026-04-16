"use client";

import { SidebarTrigger } from "@crosmos/ui/components/sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@crosmos/ui/components/breadcrumb";
import { usePathname } from "next/navigation";
import { breadcrumbLabelMap } from "@/config/nav";

export function DashboardHeader() {
	const pathname = usePathname();
	const label = breadcrumbLabelMap[pathname] ?? "Home";

	return (
		<header className="flex h-14 shrink-0 items-center gap-2 px-4">
			<SidebarTrigger />
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>{label}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</header>
	);
}
