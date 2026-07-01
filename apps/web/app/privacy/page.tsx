import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { getLegalDoc } from "@/lib/legal";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const DESCRIPTION =
	"How Crosmos collects, uses, and protects information when you use the Service, including your rights and how to exercise them.";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: DESCRIPTION,
	alternates: {
		canonical: "/privacy",
	},
	openGraph: {
		title: "Privacy Policy — Crosmos",
		description: DESCRIPTION,
		type: "article",
		images: [OG_IMAGE],
	},
	twitter: {
		card: "summary_large_image",
		title: "Privacy Policy — Crosmos",
		description: DESCRIPTION,
		images: [OG_IMAGE.url],
	},
};

export default function PrivacyPage() {
	const canonicalUrl = `${SITE_URL}/privacy`;
	const webPageJsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Privacy Policy",
		description: DESCRIPTION,
		url: canonicalUrl,
		isPartOf: {
			"@type": "WebSite",
			name: SITE_NAME,
			url: SITE_URL,
		},
	};
	const doc = getLegalDoc("privacy");
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
