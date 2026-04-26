import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { Suspense } from "react";
import { AuthCallbackHandler } from "./handler";

export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-1 min-h-0 items-center justify-center">
					<AnimatedSpinner name="pulse" size="1.5rem" color="#ffffff" />
				</div>
			}
		>
			<AuthCallbackHandler />
		</Suspense>
	);
}
