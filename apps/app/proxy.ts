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

// Dedupes concurrent refreshes of the same token (e.g. several tabs at expiry)
// into a single backend call.
const inFlight = new Map<string, Promise<TokenResponse | null>>();

// Refreshes the access token before render so Server Components read a fresh
// token (they can't write cookies). Not an auth guard — the backend still
// validates every request in the data layer.
export async function proxy(request: NextRequest) {
	const isPrefetch =
		request.headers.has("next-router-prefetch") ||
		request.headers.get("purpose") === "prefetch";

	const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
	const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	// TEMP debug — remove after verifying. Watch the `bun run dev` terminal.
	console.log(
		`[proxy] ${request.nextUrl.pathname} prefetch=${isPrefetch} hasAccess=${!!accessToken} hasRefresh=${!!refreshToken} expired=${isExpired(accessToken)}`,
	);

	if (isPrefetch || !apiUrl || !refreshToken || !isExpired(accessToken)) {
		return NextResponse.next();
	}

	const activeOrgId = request.cookies.get(ACTIVE_ORG_COOKIE)?.value;
	const tokens = await refresh(apiUrl, refreshToken, activeOrgId);
	console.log(`[proxy] refresh ${tokens ? "OK" : "FAILED"} for ${request.nextUrl.pathname}`); // TEMP

	// Refresh failed → drop cookies; the data layer then 401s and redirects.
	if (!tokens) {
		const response = NextResponse.next();
		response.cookies.delete(ACCESS_TOKEN_COOKIE);
		response.cookies.delete(REFRESH_TOKEN_COOKIE);
		response.cookies.delete(ACTIVE_ORG_COOKIE);
		response.headers.set("Cache-Control", "no-store");
		return response;
	}

	// Expose the new tokens to this render (request) and persist them (response).
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

function refresh(
	apiUrl: string,
	refreshToken: string,
	activeOrgId: string | undefined,
): Promise<TokenResponse | null> {
	const existing = inFlight.get(refreshToken);
	if (existing) return existing;

	const pending = fetchRefresh(apiUrl, refreshToken, activeOrgId).finally(() =>
		inFlight.delete(refreshToken),
	);
	inFlight.set(refreshToken, pending);
	return pending;
}

async function fetchRefresh(
	apiUrl: string,
	refreshToken: string,
	activeOrgId: string | undefined,
): Promise<TokenResponse | null> {
	const res = await fetch(`${apiUrl}/auth/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			refresh_token: refreshToken,
			active_org_id: activeOrgId ?? undefined,
		}),
		cache: "no-store",
	}).catch(() => null);

	if (!res?.ok) return null;
	return (await res.json()) as TokenResponse;
}

// Missing, unparseable, or within 60s of its JWT `exp`.
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
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)"],
};
