"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	IconBrandGithubFilled,
	IconMoonFilled,
	IconSunFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LINKS } from "@/config/links";
import { cn } from "@crosmos/ui/lib/utils";

export function Navbar() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
		setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

	return (
        <header className={cn								("sticky top-0 z-50 bg-background border-border", isScrolled ? "bg-background/90 backdrop-blur-xl border-b" : "bg-transparent")}>
			<nav className="max-w-7xl mx-auto py-4 flex items-center justify-between">
				<div className="flex items-center gap-10">
					<div className="flex items-center gap-2">
						{mounted &&
							(theme === "light" ? (
								<Image
									src="/banner_light.svg"
									alt="Crosmos"
									width={120}
									height={32}
									className="h-8 w-auto"
									priority
									unoptimized
								/>
							) : (
								<Image
									src="/banner_dark.svg"
									alt="Crosmos"
									width={120}
									height={32}
									className="h-8 w-auto"
									priority
									unoptimized
								/>
							))}
					</div>
					<div className="hidden lg:flex items-center gap-8">
						<a
							href="#products"
							className="text-foreground/70 text-sm font-medium link-underline"
						>
							PRODUCTS
						</a>
						<a
							href="#pricing"
							className="text-foreground/70 text-sm font-medium link-underline"
						>
							PRICING
						</a>
						<a
							href="#developers"
							className="text-foreground/70 text-sm font-medium link-underline"
						>
							DEVELOPERS
						</a>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<button className="p-2 text-foreground/70 hover:text-accent transition-colors rounded hover:bg-secondary/20">
						<Link href={LINKS.social.github} target="_blank">
							<IconBrandGithubFilled size={16} />
						</Link>
					</button>
					<button
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="p-2 text-foreground/70 hover:text-accent transition-colors rounded hover:bg-secondary/20"
						aria-label="Toggle dark mode"
					>
						{mounted &&
							(theme === "dark" ? (
								<IconSunFilled size={16} />
							) : (
								<IconMoonFilled size={16} />
							))}
					</button>
					<Button
						size="lg"
						variant="default"
						className="hover:bg-accent/90 px-6 py-2 rounded font-semibold text-sm transition-colors"
					>
						Get Started
					</Button>
				</div>
			</nav>
		</header>
	);
}
