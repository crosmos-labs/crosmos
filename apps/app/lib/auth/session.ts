import "server-only";

import {
	type AuthUser,
	type TokenResponse,
	toAuthUser,
} from "@/lib/types/auth";
import {
	getAccessToken,
	getActiveOrgId,
	getRefreshToken,
	setActiveOrgCookie,
	setAuthCookies,
} from "./cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Holds the in-flight refresh promise so concurrent callers deduplicate
 * into a single POST /auth/refresh request instead of racing.
 */
let inFlightRefresh: Promise<TokenResponse | null> | null = null;

export async function refreshTokens(): Promise<TokenResponse | null> {
	// If a refresh is already running, reuse its promise instead of starting another
	if (inFlightRefresh) return inFlightRefresh;

	// Assign the dedup promise so late callers see it before any awaits
	inFlightRefresh = (async () => {
		const refreshToken = await getRefreshToken();
		if (!refreshToken || !API_URL) return null;

		// Refresh tokens are org-agnostic; without this hint the backend resets
		// context to the user's default org, dropping a switched active org.
		const activeOrgId = await getActiveOrgId();

		try {
			const res = await fetch(`${API_URL}/auth/refresh`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					refresh_token: refreshToken,
					active_org_id: activeOrgId ?? undefined,
				}),
				cache: "no-store",
			});

			// Non-destructive: don't clear cookies on a lost rotation race.
			if (!res.ok) return null;

			const data = (await res.json()) as TokenResponse;
			await setAuthCookies(data.access_token, data.refresh_token);
			if (data.active_org_id != null) {
				await setActiveOrgCookie(data.active_org_id);
			}
			return data;
		} catch {
			return null;
		}
	})();

	try {
		return await inFlightRefresh;
	} finally {
		// Clear only after all callers have settled so the next refresh starts fresh
		inFlightRefresh = null;
	}
}

export async function verifyAuth(): Promise<AuthUser | null> {
	if (!API_URL) return null;

	let accessToken = await getAccessToken();
	let refreshedAtStart = false;
	if (!accessToken) {
		const refreshed = await refreshTokens();
		if (!refreshed) return null;
		accessToken = refreshed.access_token;
		refreshedAtStart = true;
	}

	try {
		const res = await fetch(`${API_URL}/auth/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		});

		if (res.ok) {
			return toAuthUser(await res.json());
		}

		if ((res.status === 401 || res.status === 404) && !refreshedAtStart) {
			const refreshed = await refreshTokens();
			if (!refreshed) return null;

			const retryRes = await fetch(`${API_URL}/auth/me`, {
				headers: { Authorization: `Bearer ${refreshed.access_token}` },
				cache: "no-store",
			});

			if (retryRes.ok) {
				return toAuthUser(await retryRes.json());
			}
		}
		return null;
	} catch {
		return null;
	}
}

// Read-only: never refreshes/writes cookies, so it's safe during RSC render.
export async function peekUser(): Promise<AuthUser | null> {
	if (!API_URL) return null;

	const accessToken = await getAccessToken();
	if (!accessToken) return null;

	try {
		const res = await fetch(`${API_URL}/auth/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		});
		return res.ok ? toAuthUser(await res.json()) : null;
	} catch {
		return null;
	}
}
