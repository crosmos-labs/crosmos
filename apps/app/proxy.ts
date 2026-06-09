import { type NextRequest, NextResponse } from "next/server";
import {
	ACCESS_TOKEN_COOKIE,
	ACCESS_TOKEN_MAX_AGE,
	ACTIVE_ORG_COOKIE,
	ACTIVE_ORG_MAX_AGE,
	COOKIE_OPTIONS,
	REFRESH_TOKEN_COOKIE,
	REFRESH_TOKEN_MAX_AGE,
} from "@/lib/auth/cookie-config";
import type { TokenResponse } from "@/lib/types/auth";

const REFRESH_TIMEOUT_MS = 3000;

// Refreshes the access token before render so server components read a fresh
// token. This is an optimistic ux layer; backend requests still enforce auth.
export async function proxy(request: NextRequest) {
	const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
	const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	if (!isExpired(accessToken)) return NextResponse.next();

	const activeOrgId = request.cookies.get(ACTIVE_ORG_COOKIE)?.value;
	const tokens =
		apiUrl && refreshToken
			? await refresh(apiUrl, refreshToken, activeOrgId)
			: null;

	if (!tokens) {
		if (isPublicRoute(request.nextUrl.pathname)) return NextResponse.next();
		const response = NextResponse.redirect(new URL("/signup", request.url));
		response.headers.set("Cache-Control", "no-store");
		response.cookies.delete(ACCESS_TOKEN_COOKIE);
		response.cookies.delete(REFRESH_TOKEN_COOKIE);
		response.cookies.delete(ACTIVE_ORG_COOKIE);
		return response;
	}

	request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token);
	request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token);
	if (tokens.active_org_id != null) {
		request.cookies.set(ACTIVE_ORG_COOKIE, tokens.active_org_id);
	}

	const response = NextResponse.next({ request });
	response.headers.set("Cache-Control", "no-store");
	response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
		...COOKIE_OPTIONS,
		maxAge: ACCESS_TOKEN_MAX_AGE,
	});
	response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
		...COOKIE_OPTIONS,
		maxAge: REFRESH_TOKEN_MAX_AGE,
	});
	if (tokens.active_org_id != null) {
		response.cookies.set(ACTIVE_ORG_COOKIE, tokens.active_org_id, {
			...COOKIE_OPTIONS,
			maxAge: ACTIVE_ORG_MAX_AGE,
		});
	}
	return response;
}

async function refresh(
	apiUrl: string,
	refreshToken: string,
	activeOrgId: string | undefined,
): Promise<TokenResponse | null> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

	let res: Response;
	try {
		res = await fetch(`${apiUrl}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				refresh_token: refreshToken,
				active_org_id: activeOrgId ?? undefined,
			}),
			cache: "no-store",
			signal: controller.signal,
		});
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}

	if (!res.ok || res.headers.get("content-length") === "0") return null;

	try {
		return (await res.json()) as TokenResponse;
	} catch {
		return null;
	}
}

function isPublicRoute(pathname: string): boolean {
	return pathname === "/signup" || pathname.startsWith("/invites");
}

function isExpired(token: string | undefined): boolean {
	if (!token) return true;
	try {
		const { exp } = JSON.parse(
			Buffer.from(token.split(".")[1] ?? "", "base64url").toString(),
		) as { exp?: number };
		return typeof exp !== "number" || exp - 60 <= Date.now() / 1000;
	} catch {
		return true;
	}
}

export const config = {
	matcher: [
		{
			source: "/((?!api|_next/static|_next/image|auth/callback|.*\\..*).*)",
			missing: [
				{ type: "header", key: "next-router-prefetch" },
				{ type: "header", key: "purpose", value: "prefetch" },
			],
		},
	],
};
