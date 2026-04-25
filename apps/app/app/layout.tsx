import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

import "@crosmos/ui/globals.css";
import { Alert, AlertDescription } from "@crosmos/ui/components/alert";
import { Toaster } from "@crosmos/ui/components/sonner";
import { TooltipProvider } from "@crosmos/ui/components/tooltip";
import { IconInfoCircle } from "@tabler/icons-react";
import { SwrProvider } from "@/components/providers/swr-provider";

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
				{process.env.NODE_ENV !== "production" && (
					<Alert className="rounded-none border-x-0 border-t-0 border-b border-sidebar-border bg-sidebar py-1.5">
						<AlertDescription className="flex items-center justify-center gap-2 text-sm text-sidebar-foreground">
							<IconInfoCircle className="size-4" />
							This is a staging version and may not reflect the final product.
						</AlertDescription>
					</Alert>
				)}
			<SwrProvider>
				<TooltipProvider>{children}</TooltipProvider>
				<Toaster />
			</SwrProvider>
			</body>
		</html>
	);
}
