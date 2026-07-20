import {
	IconBrandDiscordFilled,
	IconBrandGithubFilled,
	IconBrandLinkedinFilled,
	IconBrandX,
} from "@tabler/icons-react";
import { LazyPixelBlast } from "@/components/ui/lazy-pixel-blast";
import { LINKS } from "../config/links";
import { CornerPlus } from "./ui/corner-plus";

const FOOTER_DATA = {
	product: {
		title: "Product",
		links: [{ label: "Pricing", href: LINKS.product.pricing }],
	},
	documentation: {
		title: "Documentation",
		links: [
			{ label: "Get Started", href: LINKS.documentation.getStarted },
			{ label: "Quickstart", href: LINKS.documentation.quickstart },
			{ label: "API Reference", href: LINKS.documentation.apiReference },
			{ label: "MCP", href: LINKS.documentation.mcp },
		],
	},
	company: {
		title: "Company",
		links: [
			{ label: "Blogs", href: LINKS.company.blogs },
			{ label: "Research", href: LINKS.company.research },
			{ label: "Terms of Service", href: LINKS.company.terms },
			{ label: "Privacy Policy", href: LINKS.company.privacy },
		],
	},
	social: {
		title: "Social",
		links: [
			{
				name: "Github",
				icon: IconBrandGithubFilled,
				href: LINKS.social.github,
			},
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
		],
	},
	brand: {
		name: "crosmos",
		copyright: "© 2026 Crosmos. All rights reserved.",
	},
} as const;

export function Footer() {
	return (
		<footer className="dark bg-background text-foreground border-0 relative z-30">
			<div className="absolute inset-0">
				<LazyPixelBlast
					variant="square"
					pixelSize={3}
					color="#298559"
					patternScale={2}
					patternDensity={1}
					pixelSizeJitter={0}
					enableRipples={false}
					rippleSpeed={0.4}
					rippleThickness={0.12}
					rippleIntensityScale={1}
					speed={0.5}
					edgeFade={0.2}
					transparent
					className="size-full"
				/>
			</div>
			<div className="relative z-10 max-w-7xl mx-auto lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24">
				<div className="relative bg-background border border-foreground/20">
					<CornerPlus className="top-0 left-0 hidden -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] lg:block stroke-3" />
					<CornerPlus className="top-0 right-0 hidden translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] lg:block stroke-3" />
					<CornerPlus className="bottom-0 left-0 hidden -translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] lg:block stroke-3" />
					<CornerPlus className="bottom-0 right-0 hidden translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] lg:block stroke-3" />
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 p-6 md:p-8">
						<div>
							<h3 className="font-semibold text-foreground mb-4 text-sm uppercase">
								{FOOTER_DATA.product.title}
							</h3>
							<ul className="space-y-2">
								{FOOTER_DATA.product.links.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="text-foreground/90 text-sm link-underline"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
						<div>
							<h3 className="font-semibold text-foreground mb-4 text-sm uppercase">
								{FOOTER_DATA.documentation.title}
							</h3>
							<ul className="space-y-2">
								{FOOTER_DATA.documentation.links.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="text-foreground/90 text-sm link-underline"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
						<div className="lg:text-right">
							<h3 className="font-semibold text-foreground mb-4 text-sm uppercase">
								{FOOTER_DATA.company.title}
							</h3>
							<ul className="space-y-2">
								{FOOTER_DATA.company.links.map((link) => (
									<li key={link.label}>
										<a
											href={link.href}
											className="text-foreground/90 text-sm link-underline"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
						<div className="lg:text-right">
							<h3 className="font-semibold text-foreground mb-4 text-sm uppercase">
								{FOOTER_DATA.social.title}
							</h3>
							<ul className="space-y-3">
								{FOOTER_DATA.social.links.map((social) => {
									const Icon = social.icon;
									return (
										<li
											key={social.name}
											className="flex items-center lg:justify-end gap-2"
										>
											<a
												href={social.href}
												target="_blank"
												className="text-foreground/90 text-sm link-underline inline-flex items-center gap-1.5 whitespace-nowrap"
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
					<div className="border-t border-foreground/10 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
						<p className="font-bold text-lg">{FOOTER_DATA.brand.name}</p>
						<p className="text-muted-foreground text-sm">
							{FOOTER_DATA.brand.copyright}
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
