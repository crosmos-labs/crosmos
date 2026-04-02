import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";

import "@crosmos/ui/globals.css";
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
	title: "Crosmos - Stateless is outdated, Memory compounds",
	description: "Search your memory, not your files",
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
				<Script
					src="//unpkg.com/react-scan/dist/auto.global.js"
					crossOrigin="anonymous"
					strategy="afterInteractive"
				/>
			</head>
			<body>
				<ThemeProvider enableSystem defaultTheme="light">
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
