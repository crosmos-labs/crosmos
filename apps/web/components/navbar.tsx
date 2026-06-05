"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { IconBrandGithubFilled } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNavButton, MobileNavSheet } from "@/components/mobile-nav";
import { LINKS } from "@/config/links";
import { useCalApi } from "@/hooks/use-cal-api";

export function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const initCal = useCalApi();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 0);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed top-0 left-0 right-0 z-50 bg-background border-b transition-colors duration-150",
				scrolled ? "border-border" : "border-transparent",
			)}
		>
			<nav
				aria-label="Main navigation"
				className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-0 py-6 sm:py-4 flex items-center justify-between"
			>
				<div className="flex items-center gap-10">
					<div className="flex items-center gap-2">
						<Link
							href="/"
							className="block select-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
						>
							<Image
								src="/banner_light.svg"
								alt="Crosmos"
								width={120}
								height={32}
								className="h-8 block dark:hidden"
								style={{ width: "auto" }}
								priority
							/>
						</Link>
					</div>
					<div className="hidden lg:flex items-center gap-8">
						<Link
							href="/blogs"
							className="text-foreground/90 text-sm font-medium link-underline select-none"
						>
							BLOG
						</Link>
						<Link
							href="#pricing"
							className="text-foreground/90 text-sm font-medium link-underline select-none"
						>
							PRICING
						</Link>
						<Link
							href={LINKS.social.discord}
							target="_blank"
							className="text-foreground/90 text-sm font-medium link-underline select-none"
						>
							DISCORD
						</Link>
					</div>
				</div>
				<div className="hidden lg:flex items-center gap-2">
					<Link
						href={LINKS.social.github}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub (opens in new tab)"
						className="p-2 text-foreground/90 hover:text-accent transition-colors rounded hover:bg-secondary/20 select-none inline-flex items-center"
					>
						<IconBrandGithubFilled size={16} />
					</Link>
					<button
						type="button"
						className="border border-foreground/20 hover:border-foreground/40 px-6 py-2 rounded font-semibold text-sm transition-colors select-none"
						data-cal-namespace="15min"
						data-cal-link="crosmos/15min"
						data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
						onPointerEnter={initCal}
						onFocus={initCal}
					>
						Schedule Call
					</button>
					<Link
						href={LINKS.product.console}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:bg-accent/90 bg-accent px-6 py-2 rounded font-semibold text-sm transition-colors text-primary-foreground select-none"
					>
						Get Started
					</Link>
				</div>
				<MobileNavButton
					isOpen={isMobileMenuOpen}
					onToggle={() => setIsMobileMenuOpen((prev) => !prev)}
				/>
			</nav>
			<MobileNavSheet
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
			/>
		</header>
	);
}
