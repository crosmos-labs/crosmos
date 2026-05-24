import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { getLegalDoc } from "@/lib/legal";

const DESCRIPTION =
	"How Crosmos collects, uses, and protects information when you use the Service, including your rights and how to exercise them.";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: DESCRIPTION,
	openGraph: {
		title: "Crosmos — Privacy Policy",
		description: DESCRIPTION,
		type: "article",
	},
	twitter: {
		card: "summary_large_image",
		title: "Crosmos — Privacy Policy",
		description: DESCRIPTION,
	},
};

export default function PrivacyPage() {
	const doc = getLegalDoc("privacy");
	return <LegalLayout doc={doc} />;
}
