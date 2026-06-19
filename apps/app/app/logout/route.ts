import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
	const refreshToken = await getRefreshToken();

	if (refreshToken && API_URL) {
		try {
			await fetch(`${API_URL}/auth/logout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refresh_token: refreshToken }),
				cache: "no-store",
				signal: AbortSignal.timeout(5000),
			});
		} catch (err) {
			console.warn(err);
		}
	}

	await clearAuthCookies();

	return NextResponse.redirect(new URL("/signup", request.url));
}
