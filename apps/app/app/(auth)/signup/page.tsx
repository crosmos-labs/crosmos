"use client";

import { Spinner } from "@agilek/cli-loaders";
import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import {
	IconBrandGithubFilled,
	IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { loginWithGoogle } from "../actions";

function SignupForm() {
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();

	const hasError = useMemo(
		() => searchParams.get("error") !== null,
		[searchParams],
	);

	useEffect(() => {
		if (hasError) {
			toast.error("Something went wrong. Try again later.");
		}
	}, [hasError]);

	async function handleGoogleLogin() {
		setLoading(true);
		try {
			await loginWithGoogle();
		} catch (e) {
			// Next.js redirect() works by throwing a special error with a digest
			// prefixed with "NEXT_REDIRECT". Re-throw it so the router handles
			// the navigation instead of resetting the loading state prematurely.
			if (
				(e as Error & { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")
			)
				throw e;
			setLoading(false);
		}
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
						<Spinner name="pulse" speed={1.5} size="1.1em" />
					) : (
						<>
							<IconBrandGoogleFilled className="size-5" />
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
						<IconBrandGithubFilled className="size-5" />
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
