import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
	clearInviteToken,
	clearOAuthState,
	getInviteToken,
	getOAuthState,
	setActiveOrgCookie,
	setAuthCookies,
	setAuthErrorCookie,
} from "@/lib/auth/cookies";
import { getRedirectUri } from "@/lib/auth/redirect";
import type { OAuthCallbackResponse } from "@/lib/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Finishes the OAuth flow: validates state, exchanges the code, sets the
// session cookies. On failure, flashes an error cookie and lands on /signup.
export async function GET(request: NextRequest) {
	const params = request.nextUrl.searchParams;
	const oauthError = params.get("error");
	const code = params.get("code");
	const state = params.get("state");

	if (oauthError) {
		await setAuthErrorCookie(
			oauthError === "access_denied" ? "cancelled" : "provider",
		);
		redirect("/signup");
	}

	if (!code || !state) {
		await setAuthErrorCookie("invalid");
		redirect("/signup");
	}

	const savedState = await getOAuthState();
	await clearOAuthState();

	if (!savedState || savedState !== state) {
		await setAuthErrorCookie("expired");
		redirect("/signup");
	}

	let data: OAuthCallbackResponse | null = null;
	try {
		if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

		const res = await fetch(`${API_URL}/auth/oauth/google/callback`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code, state, redirect_uri: getRedirectUri() }),
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(`Exchange failed (${res.status}): ${await res.text()}`);
		}

		data = (await res.json()) as OAuthCallbackResponse;
	} catch (err) {
		console.error("OAuth callback failed:", err);
		await setAuthErrorCookie("server");
	}

	// redirect() throws, so all calls stay outside the try/catch.
	if (!data) redirect("/signup");

	await setAuthCookies(data.access_token, data.refresh_token);
	if (data.active_org_id != null) {
		await setActiveOrgCookie(data.active_org_id);
	}

	const inviteToken = await getInviteToken();
	if (inviteToken) {
		await clearInviteToken();
		redirect(`/invites/accept?token=${encodeURIComponent(inviteToken)}`);
	}
	redirect("/");
}
