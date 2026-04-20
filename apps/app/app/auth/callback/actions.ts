"use server";

import {
	clearOAuthState,
	getOAuthState,
	setActiveOrgCookie,
	setAuthCookies,
} from "@/lib/auth/cookies";
import { getRedirectUri } from "@/lib/auth/redirect";
import type { OAuthCallbackResponse } from "@/lib/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function handleOAuthCallback(code: string, state: string) {
	if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

	const savedState = await getOAuthState();
	await clearOAuthState();

	if (!savedState || savedState !== state) {
		throw new Error("Invalid OAuth state parameter");
	}

	const res = await fetch(`${API_URL}/auth/oauth/google/callback`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			code,
			state,
			redirect_uri: getRedirectUri(),
		}),
		cache: "no-store",
	});

	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(`OAuth callback failed: ${errorBody}`);
	}

	const data = (await res.json()) as OAuthCallbackResponse;
	await setAuthCookies(data.access_token, data.refresh_token);
	if (data.active_org_id) {
		await setActiveOrgCookie(data.active_org_id);
	}
}
