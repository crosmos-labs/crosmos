"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crosmos/ui/components/breadcrumb";
import { SidebarTrigger } from "@crosmos/ui/components/sidebar";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionLoaderState } from "@/components/providers/action-loader-provider";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
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
	const { breadcrumb } = useBreadcrumb();

	const staticLabel = breadcrumbLabelMap[pathname] ?? "Home";

	const breadcrumbContent = breadcrumb ? (
		<BreadcrumbList>
			{breadcrumb.parent && (
				<>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href={breadcrumb.parent.href}>
								{breadcrumb.parent.label}
							</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
				</>
			)}
			<BreadcrumbItem>
				<BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	) : (
		<BreadcrumbList>
			<BreadcrumbItem>
				<BreadcrumbPage>{staticLabel}</BreadcrumbPage>
			</BreadcrumbItem>
		</BreadcrumbList>
	);

	return (
		<header className="flex h-14 shrink-0 items-center gap-2 px-4">
			<SidebarTrigger />
			<Breadcrumb>{breadcrumbContent}</Breadcrumb>
			<div className="ml-auto flex items-center">
				<ActionLoaderIndicator />
			</div>
		</header>
	);
}
