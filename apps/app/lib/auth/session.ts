import "server-only";

import {
	clearAuthCookies,
	getAccessToken,
	getRefreshToken,
	setAuthCookies,
} from "./cookies";
import type { AuthUser, TokenResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function refreshTokens(): Promise<TokenResponse | null> {
	const refreshToken = await getRefreshToken();
	if (!refreshToken || !API_URL) return null;

	try {
		const res = await fetch(`${API_URL}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh_token: refreshToken }),
			cache: "no-store",
		});

		if (!res.ok) {
			await clearAuthCookies();
			return null;
		}

		const data = (await res.json()) as TokenResponse;
		await setAuthCookies(data.access_token, data.refresh_token);
		return data;
	} catch {
		return null;
	}
}

export async function verifyAuth(): Promise<AuthUser | null> {
	const accessToken = await getAccessToken();
	if (!accessToken || !API_URL) return null;

	try {
		const res = await fetch(`${API_URL}/auth/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
			cache: "no-store",
		});

		if (res.ok) {
			return (await res.json()) as AuthUser;
		}

		if (res.status === 401) {
			const refreshed = await refreshTokens();
			if (!refreshed) return null;

			const retryRes = await fetch(`${API_URL}/auth/me`, {
				headers: { Authorization: `Bearer ${refreshed.access_token}` },
				cache: "no-store",
			});

			if (retryRes.ok) {
				return (await retryRes.json()) as AuthUser;
			}
		}

		return null;
	} catch {
		return null;
	}
}
