// When the active_org_id cookie is stale or missing, the dashboard layout
// redirects here so we can fix the cookie before rendering any org-scoped pages.
import { redirect } from "next/navigation";
import { listOrgs } from "@/actions/orgs";
import { setActiveOrgCookie } from "@/lib/auth/cookies";
import { verifyAuth } from "@/lib/auth/session";

export async function GET(request: Request) {
	const user = await verifyAuth();
	if (!user) redirect("/signup");

	const { searchParams } = new URL(request.url);
	const orgId = Number.parseInt(searchParams.get("orgId") ?? "", 10);
	if (!Number.isFinite(orgId) || orgId <= 0) redirect("/");

	const next = searchParams.get("next") ?? "/";

	const orgs = await listOrgs();
	const valid = orgs.some((o) => o.id === orgId);
	if (!valid) {
		const fallback = orgs[0];
		if (!fallback) redirect("/signup");
		redirect(
			`/auth/sync-org?orgId=${fallback.id}&next=${encodeURIComponent(next)}`,
		);
	}

	await setActiveOrgCookie(orgId);
	redirect(next);
}
