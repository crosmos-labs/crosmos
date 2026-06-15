import "server-only";
import { cookies } from "next/headers";
import {
	ACCESS_TOKEN_COOKIE,
	ACCESS_TOKEN_MAX_AGE,
	ACTIVE_ORG_COOKIE,
	ACTIVE_ORG_MAX_AGE,
	COOKIE_OPTIONS,
	INVITE_TOKEN_COOKIE,
	OAUTH_STATE_COOKIE,
	REFRESH_TOKEN_COOKIE,
	REFRESH_TOKEN_MAX_AGE,
} from "./cookie-config";

export async function setAuthCookies(
	accessToken: string,
	refreshToken: string,
) {
	const cookieStore = await cookies();

	cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
		...COOKIE_OPTIONS,
		maxAge: ACCESS_TOKEN_MAX_AGE,
	});

	cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
		...COOKIE_OPTIONS,
		maxAge: REFRESH_TOKEN_MAX_AGE,
	});
}

// Swaps only the access token, leaving the refresh token untouched — used by
// the org switcher, where POST /auth/active-org re-mints the access token only.
export async function setAccessTokenCookie(accessToken: string) {
	const cookieStore = await cookies();
	cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
		...COOKIE_OPTIONS,
		maxAge: ACCESS_TOKEN_MAX_AGE,
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
	cookieStore.delete(ACTIVE_ORG_COOKIE);
	cookieStore.delete(INVITE_TOKEN_COOKIE);
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

export async function setActiveOrgCookie(orgId: string) {
	const cookieStore = await cookies();
	cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
		...COOKIE_OPTIONS,
		maxAge: ACTIVE_ORG_MAX_AGE,
	});
}

export async function getActiveOrgId(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? null;
}

// Carries the invite token across the OAuth round-trip (which drops the original ?token=).
export async function setInviteTokenCookie(token: string) {
	const cookieStore = await cookies();
	cookieStore.set(INVITE_TOKEN_COOKIE, token, {
		...COOKIE_OPTIONS,
		maxAge: 15 * 60,
	});
}

export async function getInviteToken(): Promise<string | undefined> {
	const cookieStore = await cookies();
	return cookieStore.get(INVITE_TOKEN_COOKIE)?.value;
}

export async function clearInviteToken() {
	const cookieStore = await cookies();
	cookieStore.delete(INVITE_TOKEN_COOKIE);
}
