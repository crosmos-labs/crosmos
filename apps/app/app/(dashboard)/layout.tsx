import { redirect } from "next/navigation";
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

	return <>{children}</>;
}
