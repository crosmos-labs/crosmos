"use server";

import { redirect } from "next/navigation";
import { setOAuthState } from "@/lib/auth/cookies";
import { getRedirectUri } from "@/lib/auth/redirect";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginWithGoogle() {
	if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

	const res = await fetch(
		`${API_URL}/auth/oauth/google/authorize?redirect_uri=${encodeURIComponent(getRedirectUri())}`,
		{ cache: "no-store" },
	);

	if (!res.ok) {
		throw new Error("Failed to get authorization URL");
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

	const { authorization_url, state } = payload;

	try {
		new URL(authorization_url);
	} catch {
		throw new Error("Malformed authorization URL received");
	}

	await setOAuthState(state);

	redirect(authorization_url);
}
