"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import {
	IconBrandGithubFilled,
	IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AUTH_ERROR_COOKIE } from "@/lib/auth/cookie-config";

// Flash cookie set by the /auth/google and /auth/callback routes on failure.
// Consumed on read, so a refresh never re-shows the toast.
function consumeAuthError(): string | null {
	// document.cookie throws a SecurityError when the browser blocks cookies.
	try {
		const entry = document.cookie
			.split("; ")
			.find((c) => c.startsWith(`${AUTH_ERROR_COOKIE}=`));
		if (!entry) return null;
		// biome-ignore lint/suspicious/noDocumentCookie: CookieStore isn't cross-browser
		document.cookie = `${AUTH_ERROR_COOKIE}=; path=/; max-age=0`;
		return decodeURIComponent(entry.slice(AUTH_ERROR_COOKIE.length + 1));
	} catch {
		return null;
	}
}

function SignupForm() {
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();

	const inviteToken = useMemo(
		() => searchParams.get("invite") ?? undefined,
		[searchParams],
	);

	useEffect(() => {
		const code = consumeAuthError();
		if (code === null) return;
		if (code === "cancelled") {
			toast("Sign-in was cancelled.");
		} else if (code === "expired") {
			toast.error("Your sign-in session expired. Please try again.");
		} else if (code === "start_failed") {
			toast.error("Couldn't start sign-in. Please try again.");
		} else {
			toast.error(
				"Something went wrong while signing you in. Please try again.",
			);
		}
	}, []);

	function handleGoogleLogin() {
		setLoading(true);
		window.location.assign(
			inviteToken
				? `/auth/google?invite=${encodeURIComponent(inviteToken)}`
				: "/auth/google",
		);
	}

	return (
		<>
			<h1 className="mb-3 text-4xl font-semibold tracking-tight text-foreground">
				Get Started
			</h1>
			<p className="mb-10 text-lg text-muted-foreground">
				Enter your details to continue.
			</p>

			<div className="flex flex-col gap-4">
				<Button
					variant="outline"
					size="lg"
					className="w-full h-12 text-base"
					onClick={handleGoogleLogin}
					disabled={loading}
				>
					{loading ? (
						<AnimatedSpinner name="pulse" color="#ffffff" />
					) : (
						<>
							<IconBrandGoogleFilled className="size-5 mr-1" />
							Continue with Google
						</>
					)}
				</Button>
				<div className="relative">
					<Button
						variant="outline"
						size="lg"
						className="w-full h-12 text-base"
						disabled
					>
						<IconBrandGithubFilled className="size-5 mr-1" />
						Continue with GitHub
					</Button>
					<Badge
						variant="secondary"
						className="absolute -top-2 -right-2 text-[10px]"
					>
						Coming Soon
					</Badge>
				</div>
			</div>
		</>
	);
}

export default function SignupPage() {
	return (
		<Suspense>
			<SignupForm />
		</Suspense>
	);
}
