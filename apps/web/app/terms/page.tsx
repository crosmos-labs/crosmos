import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { getLegalDoc } from "@/lib/legal";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const DESCRIPTION =
	"The terms that govern your use of Crosmos, including acceptable use, data ownership, and limits of liability.";

export const metadata: Metadata = {
	title: "Terms of Service",
	description: DESCRIPTION,
	alternates: {
		canonical: "/terms",
	},
	openGraph: {
		title: "Terms of Service — Crosmos",
		description: DESCRIPTION,
		type: "article",
	},
	twitter: {
		card: "summary_large_image",
		title: "Terms of Service — Crosmos",
		description: DESCRIPTION,
	},
};

export default function TermsPage() {
	const canonicalUrl = `${SITE_URL}/terms`;
	const webPageJsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Terms of Service",
		description: DESCRIPTION,
		url: canonicalUrl,
		isPartOf: {
			"@type": "WebSite",
			name: SITE_NAME,
			url: SITE_URL,
		},
	};
	const doc = getLegalDoc("terms");
	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
				dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
			/>
			<LegalLayout doc={doc} />
		</>
	);
}
