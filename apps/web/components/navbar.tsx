"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { IconBrandGithubFilled } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileNavButton, MobileNavSheet } from "@/components/mobile-nav";
import { LINKS } from "@/config/links";

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed top-0 left-0 right-0 z-50 bg-background border-border",
				(isScrolled || isMobileMenuOpen) && "border-b",
			)}
		>
			<nav
				aria-label="Main navigation"
				className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-0 py-6 sm:py-4 flex items-center justify-between"
			>
				<div className="flex items-center gap-10">
					<div className="flex items-center gap-2">
						<Link href="/" className="block">
							<Image
								src="/banner_light.svg"
								alt="Crosmos"
								width={120}
								height={32}
								className="h-8 block dark:hidden"
								style={{ width: "auto" }}
								priority
							/>
							<Image
								src="/banner_dark.svg"
								alt="Crosmos"
								width={120}
								height={32}
								className="h-8 hidden dark:block"
								style={{ width: "auto" }}
								priority
							/>
						</Link>
					</div>
					<div className="hidden lg:flex items-center gap-8">
						<Link
							href="#products"
							className="text-foreground/90 text-sm font-medium link-underline"
						>
							PRODUCTS
						</Link>
						<Link
							href="#pricing"
							className="text-foreground/90 text-sm font-medium link-underline"
						>
							PRICING
						</Link>
						<Link
							href="#developers"
							className="text-foreground/90 text-sm font-medium link-underline"
						>
							DEVELOPERS
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
					<Link
						href="/demo"
						className="hover:bg-accent/90 bg-accent px-6 py-2 rounded font-semibold text-sm transition-colors text-primary-foreground"
					>
						Book a Demo
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
