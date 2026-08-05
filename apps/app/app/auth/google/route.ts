import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
	setAuthErrorCookie,
	setInviteTokenCookie,
	setOAuthState,
} from "@/lib/auth/cookies";
import { getRedirectUri } from "@/lib/auth/redirect";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Starts the OAuth flow: mints the state cookie and hands the browser to
// Google. On failure, flashes an error cookie and lands back on /signup.
export async function GET(request: NextRequest) {
	const inviteToken = request.nextUrl.searchParams.get("invite");

	let authorizationUrl: string | null = null;
	try {
		if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

		const res = await fetch(
			`${API_URL}/auth/oauth/google/authorize?redirect_uri=${encodeURIComponent(getRedirectUri())}`,
			{ cache: "no-store" },
		);
		if (!res.ok) {
			throw new Error(`Authorize request failed with status ${res.status}`);
		}

		const payload = (await res.json()) as Partial<{
			authorization_url: string;
			state: string;
		}>;
		if (
			typeof payload.authorization_url !== "string" ||
			typeof payload.state !== "string"
		) {
			throw new Error("Invalid OAuth authorize response payload");
		}

		new URL(payload.authorization_url);

		await setOAuthState(payload.state);

		// Stashed so the callback can route back to /invites/accept after login.
		if (inviteToken) {
			await setInviteTokenCookie(inviteToken);
		}

		authorizationUrl = payload.authorization_url;
	} catch (err) {
		console.error("OAuth start failed:", err);
		await setAuthErrorCookie("start_failed");
	}

	// redirect() throws, so it must stay outside the try/catch.
	redirect(authorizationUrl ?? "/signup");
}
