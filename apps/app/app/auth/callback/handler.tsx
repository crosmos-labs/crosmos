"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { handleOAuthCallback } from "./actions";

export function AuthCallbackHandler() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const executedRef = useRef(false);

	useEffect(() => {
		if (executedRef.current) return;
		executedRef.current = true;

		const oauthError = searchParams.get("error");
		const code = searchParams.get("code");
		const state = searchParams.get("state");

		if (oauthError) {
			router.replace("/signup?error=1");
			return;
		}

		if (!code || !state) {
			router.replace("/signup?error=1");
			return;
		}

		void handleOAuthCallback(code, state)
			.then(() => {
				router.replace("/");
			})
			.catch(() => {
				router.replace("/signup?error=1");
			});
	}, [searchParams, router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<AnimatedSpinner name="pulse" size="1.5rem" />
		</div>
	);
}
