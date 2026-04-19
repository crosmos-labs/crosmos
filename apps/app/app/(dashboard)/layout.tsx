import { SidebarInset, SidebarProvider } from "@crosmos/ui/components/sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ActionLoaderProvider } from "@/components/providers/action-loader-provider";
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

	const cookieStore = await cookies();
	const sidebarOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";

	return (
		<ActionLoaderProvider>
			<SidebarProvider defaultOpen={sidebarOpen}>
				<AppSidebar user={user} />
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
	);
}
