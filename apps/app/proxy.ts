import { type NextRequest, NextResponse } from "next/server";
import {
	ACCESS_TOKEN_COOKIE,
	REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/cookie-config";

// Auth gate only — refresh happens in the data layer, not here.
export function proxy(request: NextRequest) {
	const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
	const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

	if (!isExpired(accessToken) || !isExpired(refreshToken)) {
		return NextResponse.next();
	}

	if (isPublicRoute(request.nextUrl.pathname)) return NextResponse.next();
	return NextResponse.redirect(new URL("/signup", request.url));
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
			source:
				"/((?!api|_next/static|_next/image|auth/callback|auth/google|.*\\..*).*)",
			missing: [
				{ type: "header", key: "next-router-prefetch" },
				{ type: "header", key: "purpose", value: "prefetch" },
			],
		},
	],
};
