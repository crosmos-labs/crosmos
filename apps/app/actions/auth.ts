"use server";

import { apiFetch } from "@/lib/api";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies";
import type { AuthUser, MeResponse } from "@/lib/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCurrentUser(): Promise<AuthUser> {
	const me = await apiFetch<MeResponse>("/auth/me");
	return {
		user_id: me.user_id,
		email: me.email,
		name: me.name,
		active_org_id: me.org?.id ?? null,
	};
}

export async function logout() {
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
}
