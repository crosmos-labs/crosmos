import Image from "next/image";
import Link from "next/link";
import { LINKS } from "@/config/links";

function LinkArrow() {
	return (
		<svg
			className="size-4 -rotate-45 "
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<title>Arrow Right</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M13 7l5 5m0 0l-5 5m5-5H6"
			/>
		</svg>
	);
}

export function HeroBg() {
	return (
		<section
			data-hero
			className="relative min-h-screen flex flex-col overflow-hidden"
		>
			<Image
				src="/bg2.png"
				alt=""
				fill
				className="object-cover pointer-events-none select-none"
				priority
			/>

			<div className="relative flex flex-col items-center justify-start px-6 lg:px-8 xl:px-0 pt-24 sm:pt-28 md:pt-30">
				<div className="max-w-7xl mx-auto w-full text-center">
					<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-none text-foreground text-balance select-none">
						Context that evolves with your <span>Company</span>
					</h1>

					<p className="mt-6 text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto select-none">
						Persistent memory for enterprise AI. Connect your data sources,
						build a living knowledge graph, and give every agent your
						organization's full context.
					</p>

					<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link
							href={LINKS.product.console}
							target="_blank"
							rel="noopener noreferrer"
							className="h-full bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2 select-none"
						>
							Get Started
							<LinkArrow />
						</Link>
						<Link
							href={LINKS.documentation.getStarted}
							className="bg-muted/90 hover:bg-muted text-foreground border border-foreground/10 h-full px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2 select-none"
						>
							Docs
							<LinkArrow />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
