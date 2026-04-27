import { SidebarInset, SidebarProvider } from "@crosmos/ui/components/sidebar";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { listOrgs } from "@/actions/orgs";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ActionLoaderProvider } from "@/components/providers/action-loader-provider";
import { BreadcrumbProvider } from "@/components/providers/breadcrumb-provider";
import { SwrProvider } from "@/components/providers/swr-provider";
import { getActiveOrgId } from "@/lib/auth/cookies";
import { verifyAuth } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/types/auth";

const SIDEBAR_COOKIE_NAME = "sidebar_state";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user: AuthUser | null = await verifyAuth();

	if (!user) {
		redirect("/signup");
	}

	let activeOrgId: string | null = null;
	let orgs: Awaited<ReturnType<typeof listOrgs>> = [];

	try {
		[activeOrgId, orgs] = await Promise.all([getActiveOrgId(), listOrgs()]);
	} catch {
		redirect("/signup");
	}

	const fallbackOrg = orgs[0];
	if (!fallbackOrg) redirect("/signup");

	const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? fallbackOrg;
	if (activeOrg.id !== activeOrgId) {
		const headersList = await headers();
		const pathname = headersList.get("x-invoke-path") ?? "/";
		redirect(
			`/auth/sync-org?orgId=${activeOrg.id}&next=${encodeURIComponent(pathname)}`,
		);
	}

	const cookieStore = await cookies();
	const sidebarOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

	const swrFallback: Record<string, unknown> = {
		"/auth/me": user,
	};

	return (
		<SwrProvider fallback={swrFallback}>
			<ActionLoaderProvider>
				<BreadcrumbProvider>
					<SidebarProvider defaultOpen={sidebarOpen}>
						<AppSidebar user={user} orgs={orgs} activeOrg={activeOrg} />
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
