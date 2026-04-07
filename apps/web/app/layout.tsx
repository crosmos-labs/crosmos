import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";

import "@crosmos/ui/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";

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
		<html
			lang="en"
			className={`${satoshi.variable} ${jetbrainsMono.variable}`}
			suppressHydrationWarning
		>
			<head>
				{process.env.NODE_ENV === "development" && (
					<Script
						src="//unpkg.com/react-scan/dist/auto.global.js"
						crossOrigin="anonymous"
						strategy="afterInteractive"
					/>
				)}
			</head>
			<body>
				<Analytics />
				<ThemeProvider enableSystem defaultTheme="light">
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
