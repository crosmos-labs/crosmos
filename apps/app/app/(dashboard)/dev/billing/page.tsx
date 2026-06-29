import { notFound } from "next/navigation";
import { BillingDevOverlay } from "@/components/dev/billing-dev-overlay";

// Dev-only: drives the real billing page through every state via seeded SWR.
// Returns 404 in production (Next statically strips the dead branch).
export default function DevBillingPage() {
	if (process.env.NODE_ENV === "production") {
		notFound();
	}
	return <BillingDevOverlay />;
}
