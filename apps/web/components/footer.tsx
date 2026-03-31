"use client";

import {
	IconBrandDiscordFilled,
	IconBrandGithubFilled,
	IconBrandLinkedinFilled,
	IconBrandX,
} from "@tabler/icons-react";
import { LINKS } from "../config/links";

export function Footer() {
	const socialIcons = [
		{ name: "Github", icon: IconBrandGithubFilled, href: LINKS.social.github },
		{
			name: "Discord",
			icon: IconBrandDiscordFilled,
			href: LINKS.social.discord,
		},
		{
			name: "LinkedIn",
			icon: IconBrandLinkedinFilled,
			href: LINKS.social.linkedin,
		},
		{ name: "X", icon: IconBrandX, href: LINKS.social.x },
	];

	return (
		<footer className="py-16">
			<div className="relative flex justify-center items-center h-50 mb-16">
				<div className="absolute inset-0 bg-[url('/bg-dither.svg')] size-full bg-cover bg-no-repeat bg-center" />
				{/*<h2 className="relative text-center font-bold text-shadow-accent text-[10vw] align-middle">
					crosmos
				</h2>*/}
			</div>
			<div className="max-w-7xl mx-auto px-6">
				<div className="pt-8 flex justify-between items-center mb-12">
					<div className="flex flex-col items-center">
						<h3 className="font-semibold text-foreground mb-4 text-sm uppercase">
							Product
						</h3>
						<ul className="space-y-2 text-start">
							<li>
								<a
									href={LINKS.product.playground}
									className="text-foreground/70 text-sm link-underline"
								>
									Playground
								</a>
							</li>
							<li>
								<a
									href={LINKS.product.download}
									className="text-foreground/70 text-sm link-underline"
								>
									Download
								</a>
							</li>
							<li>
								<a
									href={LINKS.product.changelog}
									className="text-foreground/70 text-sm link-underline"
								>
									Changelog
								</a>
							</li>
							<li>
								<a
									href={LINKS.product.pricing}
									className="text-foreground/70 text-sm link-underline"
								>
									Pricing
								</a>
							</li>
						</ul>
					</div>
					<div className="flex flex-col items-center">
						<h3 className="font-semibold text-foreground mb-4 text-sm uppercase">
							Documentation
						</h3>
						<ul className="space-y-2 text-center">
							<li>
								<a
									href={LINKS.documentation.getStarted}
									className="text-foreground/70 text-sm link-underline"
								>
									Get Started
								</a>
							</li>
							<li>
								<a
									href={LINKS.documentation.apiReference}
									className="text-foreground/70 text-sm link-underline"
								>
									API Reference
								</a>
							</li>
							<li>
								<a
									href={LINKS.documentation.examples}
									className="text-foreground/70 text-sm link-underline"
								>
									Examples
								</a>
							</li>
							<li>
								<a
									href={LINKS.documentation.sdks}
									className="text-foreground/70 text-sm link-underline"
								>
									SDKs
								</a>
							</li>
						</ul>
					</div>
					<div className="flex flex-col items-center">
						<h3 className="font-semibold text-foreground mb-4 text-sm uppercase">
							Company
						</h3>
						<ul className="space-y-2 text-center">
							<li>
								<a
									href={LINKS.company.about}
									className="text-foreground/70 text-sm link-underline"
								>
									About us
								</a>
							</li>
							<li>
								<a
									href={LINKS.company.developers}
									className="text-foreground/70 text-sm link-underline"
								>
									Developers
								</a>
							</li>
							<li>
								<a
									href={LINKS.company.terms}
									className="text-foreground/70 text-sm link-underline"
								>
									Terms of Service
								</a>
							</li>
							<li>
								<a
									href={LINKS.company.privacy}
									className="text-foreground/70 text-sm link-underline"
								>
									Privacy Policy
								</a>
							</li>
						</ul>
					</div>
					<div className="flex flex-col items-end">
						<h3 className="font-semibold text-foreground mb-4 text-sm uppercase">
							Social
						</h3>
						<ul className="space-y-3">
							{socialIcons.map((social) => {
								const Icon = social.icon;
								return (
									<li
										key={social.name}
										className="flex items-center justify-end gap-2"
									>
										<a
											href={social.href}
											target="_blank"
											className="text-foreground/70 text-sm link-underline flex gap-1"
										>
											<Icon size={16} strokeWidth={1} />
											{social.name}
										</a>
									</li>
								);
							})}
						</ul>
					</div>
				</div>

				<div className="border-t border-border pt-8 flex justify-between">
					<p className="font-bold text-lg">crosmos</p>
					<p className="text-foreground/60 text-sm">
						© 2026 Crosmos. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
