import Link from "next/link";
import { LogoCarousel } from "./ui/logo-carousel";
import { TerminalAnimationDemo } from "./ui/terminal-animation-demo";

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

export function Hero() {
	return (
		<section className="min-h-screen flex flex-col justify-center overflow-hidden px-6 py-30">
			<div className="max-w-7xl mx-auto w-full">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div>
						<h1 className="text-6xl lg:text-7xl font-bold leading-none text-foreground text-balance">
							Agents{" "}
							<span className="italic font-serif font-light underline decoration-2">
								Forget
							</span>
							, Crosmos{" "}
							<span className="italic font-serif font-light underline decoration-2">
								Doesn&apos;t
							</span>
						</h1>
					</div>

					<div className="space-y-8">
						<p className="text-lg text-foreground/80 leading-relaxed">
							Stateful, self-improving memory infrastructure for AI agents.
							Memory layer that compounds intelligence — so agents get better,
							not just bigger
						</p>

						<div className="flex flex-col sm:flex-row items-start gap-4">
							<Link
								href="/demo"
								className="h-full bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2 select-none"
							>
								Book a Demo
								<LinkArrow />
							</Link>
							<Link
								href="/docs"
								className="border border-foreground/20 h-full text-foreground hover:border-foreground/40 px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2 select-none"
							>
								Docs
								<LinkArrow />
							</Link>
						</div>
					</div>
				</div>

				<div className="mt-10 pt-10 border-t border-border flex justify-between items-center gap-20">
					<p className="text-muted-foreground text-lg flex-wrap pr-8">
						Support for most stuff you use daily without any other quirks
					</p>
					<LogoCarousel />
				</div>

				<div className="mt-14 relative">
					<TerminalAnimationDemo />
				</div>
			</div>
		</section>
	);
}
