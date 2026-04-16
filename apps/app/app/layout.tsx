import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import "@crosmos/ui/globals.css";
import { Toaster } from "@crosmos/ui/components/sonner";
import { TooltipProvider } from "@crosmos/ui/components/tooltip";

const satoshi = localFont({
	src: "./fonts/Satoshi.woff2",
	variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "Crosmos",
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
			className={`${satoshi.variable} ${jetbrainsMono.variable} dark`}
			suppressHydrationWarning
		>
			<body>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-semibold"
				>
					Skip to content
				</a>
				<TooltipProvider>{children}</TooltipProvider>
				<Toaster />
			</body>
		</html>
	);
}
