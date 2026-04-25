// When the active_org_id cookie is stale or missing, the dashboard layout
// redirects here so we can fix the cookie before rendering any org-scoped pages.
//
// IMPORTANT: We use NextResponse.redirect() + response.cookies.set() instead of
// redirect() from "next/navigation" + cookies().set(), because redirect() throws
// a NEXT_REDIRECT error that causes Next.js to bypass the Set-Cookie headers —
// resulting in an infinite redirect loop.
import { NextResponse } from "next/server";
import { listOrgs } from "@/actions/orgs";
import { verifyAuth } from "@/lib/auth/session";

const COOKIE_OPTS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/",
	maxAge: 365 * 24 * 60 * 60,
};

export async function GET(request: Request) {
	const user = await verifyAuth();
	if (!user) return NextResponse.redirect(new URL("/signup", request.url));

	const { searchParams } = new URL(request.url);
	const orgId = searchParams.get("orgId");
	if (!orgId)
		return NextResponse.redirect(new URL("/", request.url));

	const next = searchParams.get("next") ?? "/";

	const orgs = await listOrgs();
	const valid = orgs.some((o) => o.id === orgId);

	let finalOrgId: string;
	let destination: string;

	if (!valid) {
		const fallback = orgs[0];
		if (!fallback) return NextResponse.redirect(new URL("/signup", request.url));
		finalOrgId = fallback.id;
		destination = `/auth/sync-org?orgId=${encodeURIComponent(fallback.id)}&next=${encodeURIComponent(next)}`;
	} else {
		finalOrgId = orgId;
		destination = next;
	}

	const response = NextResponse.redirect(new URL(destination, request.url));
	response.cookies.set("active_org_id", finalOrgId, COOKIE_OPTS);
	return response;
}