import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "@crosmos/ui/globals.css";
import "@crosmos/graph/styles.css";
import "streamdown/styles.css";
import "@/components/graph/popover.css";
import { Toaster } from "@crosmos/ui/components/sonner";
import { TooltipProvider } from "@crosmos/ui/components/tooltip";
import { SkipToContent } from "@/components/shared/skip-to-content";

const satoshi = localFont({
	src: "./fonts/Satoshi.woff2",
	variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://console.crosmos.dev"),
	title: "Console",
	description:
		"Manage Crosmos memory spaces, API keys, sources, and organization settings.",
	openGraph: {
		type: "website",
		url: "https://console.crosmos.dev",
		siteName: "Crosmos Console",
		title: "Console - Crosmos",
		description:
			"Manage Crosmos memory spaces, API keys, sources, and organization settings.",
		images: [
			{
				url: "/opengraph-image.png",
				width: 2400,
				height: 1200,
				alt: "Console - Crosmos",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Console - Crosmos",
		description:
			"Manage Crosmos memory spaces, API keys, sources, and organization settings.",
		images: ["/opengraph-image.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${satoshi.variable} ${jetbrainsMono.variable} dark h-full`}
			suppressHydrationWarning
		>
			<body className="flex flex-col h-dvh">
				<NuqsAdapter>
					<SkipToContent />
					<TooltipProvider>{children}</TooltipProvider>
					<Toaster />
					<Analytics />
				</NuqsAdapter>
			</body>
		</html>
	);
}
