import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "@crosmos/ui/globals.css";
import "@crosmos/graph/styles.css";
import { Toaster } from "@crosmos/ui/components/sonner";
import { TooltipProvider } from "@crosmos/ui/components/tooltip";
import { SkipToContent } from "@/components/skip-to-content";
import { StagingBanner } from "@/components/staging-banner";

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
	title: "Crosmos - Console",
	description: "Manage and monitor your Crosmos memory spaces and agents.",
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
					<StagingBanner />
					<TooltipProvider>{children}</TooltipProvider>
					<Toaster />
					<Analytics />
				</NuqsAdapter>
			</body>
		</html>
	);
}
