import { SidebarInset, SidebarProvider } from "@crosmos/ui/components/sidebar";
import { PastDueBanner } from "@/components/billing/past-due-banner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { RequireActiveOrg } from "@/components/layout/require-active-org";
import { ActionLoaderProvider } from "@/components/providers/action-loader-provider";
import { BreadcrumbProvider } from "@/components/providers/breadcrumb-provider";
import { SwrProvider } from "@/components/providers/swr-provider";

// Static shell: no top-level auth/cookie reads, so the dashboard routes stay
// prerenderable and <Link>-prefetchable (instant navigation). Auth is enforced
// by proxy.ts (edge) and re-verified by the backend on every request; the
// per-user sidebar data loads client-side via useCurrentUser.
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SwrProvider>
			<ActionLoaderProvider>
				<BreadcrumbProvider>
					<div className="flex min-h-0 flex-1 flex-col">
						<PastDueBanner />
						{/* translateZ(0) makes this the containing block for the fixed
						sidebar, so it starts below the banner instead of the viewport top. */}
						<SidebarProvider className="min-h-0 flex-1 [transform:translateZ(0)]">
							<RequireActiveOrg />
							<AppSidebar />
							<SidebarInset>
								<DashboardHeader />
								<div className="flex-1 overflow-auto">
									<div id="main-content" className="mx-auto max-w-5xl p-6">
										{children}
									</div>
								</div>
							</SidebarInset>
						</SidebarProvider>
					</div>
				</BreadcrumbProvider>
			</ActionLoaderProvider>
		</SwrProvider>
	);
}
