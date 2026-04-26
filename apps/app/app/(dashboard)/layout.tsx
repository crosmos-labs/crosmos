import { SidebarInset, SidebarProvider } from "@crosmos/ui/components/sidebar";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { listApiKeys } from "@/actions/api-keys";
import { listOrgs } from "@/actions/orgs";
import { listSpaces } from "@/actions/spaces";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ActionLoaderProvider } from "@/components/providers/action-loader-provider";
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

	const [spaces, apiKeys] = await Promise.all([
		listSpaces().catch(() => undefined),
		listApiKeys().catch(() => undefined),
	]);

	const cookieStore = await cookies();
	const sidebarOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

	const swrFallback: Record<string, unknown> = {
		"/auth/me": user,
		...(spaces !== undefined ? { "/spaces": spaces } : {}),
		...(apiKeys !== undefined ? { "/api-keys": apiKeys } : {}),
	};

	return (
		<SwrProvider fallback={swrFallback}>
			<ActionLoaderProvider>
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
			</ActionLoaderProvider>
		</SwrProvider>
	);
}
