import "server-only";
import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const OAUTH_STATE_COOKIE = "oauth_state";

const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/",
};

export async function setAuthCookies(
	accessToken: string,
	refreshToken: string,
) {
	const cookieStore = await cookies();

	cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
		...COOKIE_OPTIONS,
		maxAge: 30 * 60,
	});

	cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
		...COOKIE_OPTIONS,
		maxAge: 7 * 24 * 60 * 60,
	});
}

export async function getAccessToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function clearAuthCookies() {
	const cookieStore = await cookies();
	cookieStore.delete(ACCESS_TOKEN_COOKIE);
	cookieStore.delete(REFRESH_TOKEN_COOKIE);
	cookieStore.delete(OAUTH_STATE_COOKIE);
}

export async function setOAuthState(state: string) {
	const cookieStore = await cookies();
	cookieStore.set(OAUTH_STATE_COOKIE, state, {
		...COOKIE_OPTIONS,
		maxAge: 10 * 60,
	});
}

export async function getOAuthState(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(OAUTH_STATE_COOKIE)?.value;
}

export async function clearOAuthState() {
	const cookieStore = await cookies();
	cookieStore.delete(OAUTH_STATE_COOKIE);
}
