"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

// The dashboard layout is a static shell, so the "authenticated but no active
// org" redirect (previously done server-side in the layout) runs here once
// /auth/me resolves. proxy.ts still handles the unauthenticated redirect, and
// apiFetch redirects on an unrecoverable 401.
export function RequireActiveOrg() {
	const router = useRouter();
	const { data: user } = useCurrentUser();

	useEffect(() => {
		if (user && !user.active_org) {
			router.replace("/signup");
		}
	}, [user, router]);

	return null;
}
