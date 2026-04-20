"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@crosmos/ui/components/breadcrumb";
import { SidebarTrigger } from "@crosmos/ui/components/sidebar";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { useActionLoaderState } from "@/components/providers/action-loader-provider";
import { breadcrumbLabelMap } from "@/config/nav";

function ActionLoaderIndicator() {
	const { activeCount, result, fading } = useActionLoaderState();

	if (activeCount > 0) {
		return <AnimatedSpinner name="pulse" size="1.1em" />;
	}

	if (result === "success") {
		return (
			<IconCircleCheck
				className={`size-[1.1em] text-green-500 transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"}`}
			/>
		);
	}

	if (result === "error") {
		return (
			<IconCircleX
				className={`size-[1.1em] text-red-500 transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"}`}
			/>
		);
	}

	return null;
}

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
			<div className="ml-auto flex items-center">
				<ActionLoaderIndicator />
			</div>
		</header>
	);
}
