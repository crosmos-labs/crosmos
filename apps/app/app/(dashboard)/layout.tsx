import { SidebarInset, SidebarProvider } from "@crosmos/ui/components/sidebar";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { verifyAuth } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user: AuthUser | null = await verifyAuth();

	if (!user) {
		redirect("/signup");
	}

	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SidebarInset>
				<DashboardHeader />
				<div className="flex-1 overflow-auto">
					<div className="mx-auto max-w-5xl p-6">{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
