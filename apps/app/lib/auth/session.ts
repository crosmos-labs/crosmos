import "server-only";

import type { AuthUser, TokenResponse } from "@/lib/types/auth";
import {
	clearAuthCookies,
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

			if (!res.ok) {
				await clearAuthCookies();
				return null;
			}

			const data = (await res.json()) as TokenResponse;
			await setAuthCookies(data.access_token, data.refresh_token);
			// Keep the cookie aligned with the re-minted token's claim (the hint
			// is ignored if the user is no longer a member of that org).
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
	const accessToken = await getAccessToken();
	if (!accessToken || !API_URL) return null;

	const activeOrgId = await getActiveOrgId();

	const toAuthUser = (
		raw: {
			user_id: string;
			email: string;
			name: string;
		},
		activeOrgId: string | null,
	): AuthUser => ({
		user_id: raw.user_id,
		email: raw.email,
		name: raw.name,
		active_org_id: activeOrgId,
	});

	try {
		const res = await fetch(`${API_URL}/auth/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		});

		if (res.ok) {
			return toAuthUser(await res.json(), activeOrgId);
		}

		if (res.status === 401) {
			const refreshed = await refreshTokens();
			if (!refreshed) return null;

			const retryRes = await fetch(`${API_URL}/auth/me`, {
				headers: { Authorization: `Bearer ${refreshed.access_token}` },
				cache: "no-store",
			});

			if (retryRes.ok) {
				return toAuthUser(await retryRes.json(), await getActiveOrgId());
			}
		}

		return null;
	} catch {
		return null;
	}
}
