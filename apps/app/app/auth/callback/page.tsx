import { Suspense } from "react";
import { PulseSpinner } from "@/components/pulse-spinner";
import { AuthCallbackHandler } from "./handler";

export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<PulseSpinner size="1.5rem" />
				</div>
			}
		>
			<AuthCallbackHandler />
		</Suspense>
	);
}