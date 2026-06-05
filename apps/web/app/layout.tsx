import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import "@crosmos/ui/globals.css";
import "./landing.css";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

const satoshi = localFont({
	src: "./fonts/Satoshi.woff2",
	variable: "--font-sans",
	display: "swap",
	preload: true,
	adjustFontFallback: "Arial",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: SITE_TITLE,
		template: "%s | Crosmos",
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: [
		"AI memory",
		"agent memory",
		"context engineering",
		"knowledge graph",
		"persistent context",
		"enterprise AI",
		"RAG alternative",
		"LLM memory",
		"agent infrastructure",
	],
	authors: [{ name: "Crosmos Labs" }],
	creator: "Crosmos Labs",
	publisher: "Crosmos Labs",
	openGraph: {
		type: "website",
		url: SITE_URL,
		siteName: SITE_NAME,
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		locale: "en_US",
		images: [
			{
				url: "/opengraph-image.png",
				width: 1200,
				height: 630,
				alt: SITE_NAME,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		site: "@crosmoslabs",
		creator: "@crosmoslabs",
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		images: ["/opengraph-image.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

const organizationJsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: SITE_NAME,
	legalName: "Crosmos Labs",
	url: SITE_URL,
	logo: `${SITE_URL}/opengraph-image.png`,
	sameAs: [
		"https://github.com/crosmos-labs",
		"https://x.com/crosmoslabs",
		"https://www.linkedin.com/company/crosmos-ai",
	],
};

const softwareJsonLd = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: SITE_NAME,
	applicationCategory: "DeveloperApplication",
	operatingSystem: "Cross-platform",
	description: SITE_DESCRIPTION,
	url: SITE_URL,
	offers: {
		"@type": "Offer",
		price: "0",
		priceCurrency: "USD",
	},
	publisher: {
		"@type": "Organization",
		name: "Crosmos Labs",
		url: SITE_URL,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${satoshi.variable} ${jetbrainsMono.variable}`}>
			<body>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-semibold"
				>
					Skip to content
				</a>
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(organizationJsonLd),
					}}
				/>
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(softwareJsonLd),
					}}
				/>
				<Analytics />
				<main id="main-content" className="flex flex-col relative">
					<Navbar />
					{children}
				</main>
				<Footer />
			</body>
		</html>
	);
}
