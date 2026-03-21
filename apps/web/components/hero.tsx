"use client";

import { Button } from "@crosmos/ui/components/button";
import Image from "next/image";

function LinkArrow() {
	return (
		<svg
			className="w-4 h-4 -rotate-45"
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
		<section className="min-h-screen flex flex-col justify-center overflow-hidden px-6 py-28">
			<div className="max-w-7xl mx-auto w-full">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					{/* Left column - Headline */}
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

					{/* Right column - Description and CTAs */}
					<div className="space-y-8">
						<p className="text-lg text-foreground/70 leading-relaxed">
							Source control with out-of-the box codebase retrieval, fast
							utility SLMs, and task-specific agents you can run on any repo,
						</p>

						<div className="flex flex-col sm:flex-row items-start gap-4">
							<Button className="h-full bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2">
								Get Started
								<LinkArrow />
							</Button>
							<Button
								variant="outline"
								className="border border-foreground/20 h-full text-foreground hover:border-foreground/40 hover:bg-secondary/10 px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2"
							>
								Docs
								<LinkArrow />
							</Button>
						</div>
					</div>
				</div>

				{/* Showcase image section */}
				<div className="mt-28 relative">
					{/*<Image
						// src="/hero-image.png"
						src="/dither.png"
						alt="Crosmos IDE showcase"
						className="w-full rounded shadow-2xl"
						width={500}
						height={500}
					/>*/}
					<video autoPlay muted loop className="w-full rounded shadow-2xl">
						<source src="/dither.mp4" type="video/mp4" />
						Your browser does not support the video tag.
					</video>
				</div>
			</div>
		</section>
	);
}
