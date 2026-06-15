import "server-only";

import {
	type AuthUser,
	type TokenResponse,
	toAuthUser,
} from "@/lib/types/auth";
import type { ActiveOrgSummary } from "@/lib/types/org";
import {
	clearAuthCookies,
	getAccessToken,
	getActiveOrgId,
	getRefreshToken,
	setActiveOrgCookie,
	setAuthCookies,
} from "./cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface OrgListFallbackResponse {
	orgs: Array<ActiveOrgSummary & { created_at?: string }>;
}

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
			return withActiveOrgFallback(toAuthUser(await res.json()), accessToken);
		}

		if (res.status === 401 && !refreshedAtStart) {
			const refreshed = await refreshTokens();
			if (!refreshed) return null;

			const retryRes = await fetch(`${API_URL}/auth/me`, {
				headers: { Authorization: `Bearer ${refreshed.access_token}` },
				cache: "no-store",
			});

			if (retryRes.ok) {
				return withActiveOrgFallback(
					toAuthUser(await retryRes.json()),
					refreshed.access_token,
				);
			}
		}
		return null;
	} catch {
		return null;
	}
}

async function withActiveOrgFallback(
	user: AuthUser,
	accessToken: string,
): Promise<AuthUser> {
	if (user.active_org || user.active_org_id) return user;

	// TODO: remove this fallback after production backend is synced with the
	// /auth/me contract that returns user_id and org details.
	const activeOrg = await resolveActiveOrgFromOrgs(accessToken);
	if (!activeOrg) return user;

	return {
		...user,
		active_org_id: activeOrg.id,
		active_org: activeOrg,
	};
}

async function resolveActiveOrgFromOrgs(
	accessToken: string,
): Promise<ActiveOrgSummary | null> {
	const activeOrgId = await getActiveOrgId();

	try {
		const res = await fetch(`${API_URL}/orgs`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		});

		if (!res.ok) return null;

		const data = (await res.json()) as OrgListFallbackResponse;
		const org =
			data.orgs.find((item) => item.id === activeOrgId) ?? data.orgs[0] ?? null;

		if (!org) return null;

		return {
			id: org.id,
			slug: org.slug,
			name: org.name,
			your_role: org.your_role,
		};
	} catch {
		return null;
	}
}
