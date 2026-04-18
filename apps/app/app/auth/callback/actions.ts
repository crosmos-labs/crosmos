"use server";

import {
	clearOAuthState,
	getOAuthState,
	setAuthCookies,
} from "@/lib/auth/cookies";
import type { OAuthCallbackResponse } from "@/lib/auth/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REDIRECT_URI =
	process.env.NEXT_PUBLIC_REDIRECT_URI ?? "http://localhost:3000/auth/callback";

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
			redirect_uri: REDIRECT_URI,
		}),
		cache: "no-store",
	});

	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(`OAuth callback failed: ${errorBody}`);
	}

	const data = (await res.json()) as OAuthCallbackResponse;
	await setAuthCookies(data.access_token, data.refresh_token);
}
