"use server";

import { redirect } from "next/navigation";
import { setOAuthState } from "@/lib/auth/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REDIRECT_URI =
	process.env.NEXT_PUBLIC_REDIRECT_URI ?? "http://localhost:3000/auth/callback";

export async function loginWithGoogle() {
	if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

	const res = await fetch(
		`${API_URL}/auth/oauth/google/authorize?redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
		{ cache: "no-store" },
	);

	if (!res.ok) {
		throw new Error("Failed to get authorization URL");
	}

	const { authorization_url, state } = (await res.json()) as {
		authorization_url: string;
		state: string;
	};

	await setOAuthState(state);

	redirect(authorization_url);
}
