import { SidebarInset, SidebarProvider } from "@crosmos/ui/components/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ActionLoaderProvider } from "@/components/providers/action-loader-provider";
import { BreadcrumbProvider } from "@/components/providers/breadcrumb-provider";
import { SwrProvider } from "@/components/providers/swr-provider";
import { verifyAuth } from "@/lib/auth/session";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [user, cookieStore] = await Promise.all([verifyAuth(), cookies()]);

	if (!user) {
		redirect("/signup");
	}

	if (!user.active_org) {
		redirect("/signup");
	}

	const sidebarOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

	const swrFallback: Record<string, unknown> = {
		"/auth/me": user,
	};

	return (
		<SwrProvider fallback={swrFallback}>
			<ActionLoaderProvider>
				<BreadcrumbProvider>
					<SidebarProvider defaultOpen={sidebarOpen}>
						<AppSidebar user={user} activeOrg={user.active_org} />
						<SidebarInset>
							<DashboardHeader />
							<div className="flex-1 overflow-auto">
								<div id="main-content" className="mx-auto max-w-5xl p-6">
									{children}
								</div>
							</div>
						</SidebarInset>
					</SidebarProvider>
				</BreadcrumbProvider>
			</ActionLoaderProvider>
		</SwrProvider>
	);
}
