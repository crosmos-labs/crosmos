import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { getLegalDoc } from "@/lib/legal";

const DESCRIPTION =
	"The terms that govern your use of Crosmos, including acceptable use, data ownership, and limits of liability.";

export const metadata: Metadata = {
	title: "Terms of Service",
	description: DESCRIPTION,
	openGraph: {
		title: "Crosmos — Terms of Service",
		description: DESCRIPTION,
		type: "article",
	},
	twitter: {
		card: "summary_large_image",
		title: "Crosmos — Terms of Service",
		description: DESCRIPTION,
	},
};

export default function TermsPage() {
	const doc = getLegalDoc("terms");
	return <LegalLayout doc={doc} />;
}
