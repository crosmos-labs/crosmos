"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function logout() {
	const refreshToken = await getRefreshToken();

	if (refreshToken && API_URL) {
		try {
			const res = await fetch(`${API_URL}/auth/logout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refresh_token: refreshToken }),
				cache: "no-store",
			});
			console.log(res)
        } catch (err) {
            console.log(err)
		}
	}

	await clearAuthCookies();
	redirect("/signup");
}
