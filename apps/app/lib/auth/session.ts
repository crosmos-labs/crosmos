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

export class AuthUnavailableError extends Error {
	constructor() {
		super("Authentication service is temporarily unavailable");
		this.name = "AuthUnavailableError";
	}
}

export interface VerifyAuthOptions {
	allowRefresh?: boolean;
}

const inFlightRefreshes = new Map<string, Promise<TokenResponse | null>>();

export async function refreshTokens(): Promise<TokenResponse | null> {
	const refreshToken = await getRefreshToken();
	if (!refreshToken || !API_URL) return null;

	const existing = inFlightRefreshes.get(refreshToken);
	const promise =
		existing ??
		(async (): Promise<TokenResponse | null> => {
			try {
				// Refresh tokens are org-agnostic; without this hint the backend resets
				// context to the user's default org, dropping a switched active org.
				const activeOrgId = await getActiveOrgId();
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
					if (res.status === 408 || res.status === 429 || res.status >= 500) {
						throw new AuthUnavailableError();
					}
					return null;
				}

				const data = (await res.json()) as TokenResponse;
				if (
					typeof data.access_token !== "string" ||
					typeof data.refresh_token !== "string"
				) {
					throw new AuthUnavailableError();
				}

				return data;
			} catch (error) {
				if (error instanceof AuthUnavailableError) throw error;
				throw new AuthUnavailableError();
			}
		})();

	if (!existing) inFlightRefreshes.set(refreshToken, promise);
	try {
		const data = await promise;
		if (!data) return null;

		await setAuthCookies(data.access_token, data.refresh_token);
		if (data.active_org_id != null) {
			await setActiveOrgCookie(data.active_org_id);
		}
		return data;
	} catch (error) {
		if (error instanceof AuthUnavailableError) throw error;
		throw new AuthUnavailableError();
	} finally {
		if (inFlightRefreshes.get(refreshToken) === promise) {
			inFlightRefreshes.delete(refreshToken);
		}
	}
}

export async function verifyAuth(
	options: VerifyAuthOptions = {},
): Promise<AuthUser | null> {
	if (!API_URL) return null;

	const allowRefresh = options.allowRefresh ?? true;
	let accessToken = await getAccessToken();
	let refreshedAtStart = false;
	if (!accessToken) {
		if (!allowRefresh) return null;
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

		if (res.status === 408 || res.status === 429 || res.status >= 500) {
			throw new AuthUnavailableError();
		}

		if (res.status === 401 && allowRefresh && !refreshedAtStart) {
			const refreshed = await refreshTokens();
			if (!refreshed) return null;

			const retryRes = await fetch(`${API_URL}/auth/me`, {
				headers: {
					Authorization: `Bearer ${refreshed.access_token}`,
				},
				cache: "no-store",
			});

			if (retryRes.ok) {
				return toAuthUser(await retryRes.json());
			}
			if (
				retryRes.status === 408 ||
				retryRes.status === 429 ||
				retryRes.status >= 500
			) {
				throw new AuthUnavailableError();
			}
		}
		return null;
	} catch (error) {
		if (!allowRefresh) return null;
		if (error instanceof AuthUnavailableError) throw error;
		throw new AuthUnavailableError();
	}
}
