"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
	clearAuthCookies,
	getRefreshToken,
	setAccessTokenCookie,
	setActiveOrgCookie,
} from "@/lib/auth/cookies";
import { verifyAuth } from "@/lib/auth/session";
import { assertFeatureEnabled, isSettingsDisabled } from "@/lib/features";
import type {
	AuthUser,
	MeResponse,
	SetActiveOrgResponse,
} from "@/lib/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Routes through verifyAuth so the client gets the same user the server layout
// used to provide — including the active-org fallback and 401 refresh/retry.
export async function getCurrentUser(): Promise<AuthUser> {
	const user = await verifyAuth();
	if (!user) redirect("/signup");
	return user;
}

export async function setActiveOrg(orgId: string): Promise<void> {
	const res = await apiFetch<SetActiveOrgResponse>("/auth/active-org", {
		method: "POST",
		body: JSON.stringify({ org_id: orgId }),
	});
	await setAccessTokenCookie(res.access_token);
	await setActiveOrgCookie(res.active_org_id);
}

export async function updateProfile(name: string): Promise<MeResponse> {
	assertFeatureEnabled(isSettingsDisabled, "Settings");

	return apiFetch<MeResponse>("/auth/me", {
		method: "PATCH",
		body: JSON.stringify({ name }),
	});
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
