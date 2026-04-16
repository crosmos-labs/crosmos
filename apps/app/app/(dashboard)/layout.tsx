import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/auth/session";
import type { AuthUser } from "@/lib/auth/types";
import { SidebarProvider } from "@crosmos/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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
			<main className="flex-1 overflow-auto">{children}</main>
		</SidebarProvider>
	);
}
