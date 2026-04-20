import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import "@crosmos/ui/globals.css";
import "./style.css";
import { Analytics } from "@vercel/analytics/next";

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
	title: "Crosmos - The Memory and Context Layer for Agents",
	description:
		"Give your agents reliable memory and the right context, with enterprise APIs, MCP integration, and flexible plugins and connectors.",
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
				<main id="main-content" className="flex flex-col">
					<Navbar />
					{children}
				</main>
				<Footer />
			</body>
		</html>
	);
}
