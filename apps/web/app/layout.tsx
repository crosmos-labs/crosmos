import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import "@crosmos/ui/globals.css";
import "./landing.css";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SmoothScroll } from "@/components/smooth-scroll";

const satoshi = localFont({
	src: "./fonts/Satoshi.woff2",
	variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://crosmos.dev"),
	title: "Crosmos - Persistent Context for Company AI",
	description:
		"Persistent memory for enterprise AI. Connect your data sources, build a living knowledge graph, and give every agent your organization's full context.",
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
				<Analytics />
				<main id="main-content" className="flex flex-col relative">
					<SmoothScroll>
						<Navbar />
						{children}
					</SmoothScroll>
				</main>
				<Footer />
			</body>
		</html>
	);
}
