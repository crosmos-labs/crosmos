"use client";

import { Spinner } from "@agilek/cli-loaders";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { handleOAuthCallback } from "./actions";

export default function AuthCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const oauthError = searchParams.get("error");
		const code = searchParams.get("code");
		const state = searchParams.get("state");

		if (oauthError) {
			router.replace(`/signup?error=1`);
			return;
		}

		if (!code || !state) {
			router.replace("/signup?error=1");
			return;
		}

		handleOAuthCallback(code, state)
			.then(() => {
				router.replace("/");
			})
			.catch(() => {
				router.replace("/signup?error=1");
			});
	}, [searchParams, router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<Spinner name="pulse" speed={1.5} size="1.5rem" />
		</div>
	);
}
