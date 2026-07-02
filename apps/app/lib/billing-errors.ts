import { toast } from "sonner";

// Backend billing errors carry machine slugs in `detail`; map the shared ones.
export function toastBillingError(err: unknown, fallback: string): void {
	const msg = err instanceof Error ? err.message : "";
	if (msg.includes("rate_limited")) {
		toast.error("Too many attempts. Try again shortly.");
	} else if (msg.includes("provider_error")) {
		toast.error("Payment provider error. Please try again.");
	} else {
		toast.error(fallback);
	}
}
