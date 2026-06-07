"use client";

import { Button } from "@crosmos/ui/components/button";
import { cn } from "@crosmos/ui/lib/utils";
import { IconBrandGithubFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { LINKS } from "@/config/links";

const NAV_LINKS = [
	{ href: "/blogs", label: "BLOGS" },
	{ href: LINKS.product.pricing, label: "PRICING" },
	{ href: LINKS.social.discord, label: "DISCORD" },
] as const;

function MobileNavButton({
	isOpen,
	onToggle,
}: {
	isOpen: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="flex items-center gap-2 lg:hidden">
			<Button
				variant="ghost"
				size="icon"
				onClick={onToggle}
				aria-label={isOpen ? "Close menu" : "Open menu"}
				aria-expanded={isOpen}
				data-mobile-nav-toggle
				className="relative flex flex-col items-center justify-center gap-1.25 focus-visible:ring-0 focus-visible:border-transparent focus-visible:outline-none"
			>
				<span
					className={cn(
						"h-0.5 w-4 bg-current rounded-full transition-all duration-300 origin-center",
						isOpen && "translate-y-1.75 rotate-45",
					)}
				/>
				<span
					className={cn(
						"h-0.5 w-4 bg-current rounded-full transition-all duration-300",
						isOpen && "opacity-0",
					)}
				/>
				<span
					className={cn(
						"h-0.5 w-4 bg-current rounded-full transition-all duration-300 origin-center",
						isOpen && "-translate-y-1.75 -rotate-45",
					)}
				/>
			</Button>
		</div>
	);
}

function MobileNavSheet({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const sheetRef = useRef<HTMLDivElement>(null);

	const handleClose = useCallback(() => {
		if (isOpen) {
			onClose();
		}
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) return;

		const sheet = sheetRef.current;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		const handleFocusOut = (e: FocusEvent) => {
			const related = e.relatedTarget as HTMLElement | null;
			if (related?.closest?.("[data-mobile-nav-toggle]")) return;
			if (!sheet?.contains(related)) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		sheet?.addEventListener("focusout", handleFocusOut);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			sheet?.removeEventListener("focusout", handleFocusOut);
		};
	}, [isOpen, onClose]);

	return (
		<div className="lg:hidden">
			<div
				className={cn(
					"grid transition-all duration-300 ease-in-out",
					isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="overflow-hidden">
					<div className="border-b border-border bg-background">
						<div
							ref={sheetRef}
							className="max-w-7xl mx-auto px-6 pt-3 pb-4 sm:px-6 lg:px-8 xl:px-0"
						>
							<div className="flex flex-col gap-3">
								{NAV_LINKS.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										onClick={handleClose}
										className="text-foreground/90 text-sm font-medium py-1"
									>
										{link.label}
									</Link>
								))}
							</div>
							<div className="mt-3 flex flex-col gap-3 border-t border-border pt-3">
								<Link
									href={LINKS.social.github}
									target="_blank"
									rel="noopener noreferrer"
									onClick={handleClose}
									className="flex items-center gap-2 text-foreground/90 text-sm font-medium py-1"
								>
									<IconBrandGithubFilled size={16} />
									GitHub
								</Link>
								<Link
									href={LINKS.product.console}
									onClick={handleClose}
									className="hover:bg-accent/90 bg-accent px-6 py-2.5 rounded font-semibold text-sm transition-colors text-primary-foreground text-center"
								>
									Get Started
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export { MobileNavButton, MobileNavSheet };
