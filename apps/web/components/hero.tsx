"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	type TabContent,
	TerminalAnimationBlinkingCursor,
	TerminalAnimationCommandBar,
	TerminalAnimationContainer,
	TerminalAnimationContent,
	TerminalAnimationOutput,
	TerminalAnimationRoot,
	TerminalAnimationTabList,
	TerminalAnimationTabTrigger,
	TerminalAnimationTrailingPrompt,
	TerminalAnimationWindow,
	type TerminalLine,
} from "@crosmos/ui/components/terminal-animation";

import { cn } from "@crosmos/ui/lib/utils";
import { useState } from "react";
import { LogoCarousel } from "./ui/logo-carousel";

export interface TerminalAnimationDemoProps {
	/** Tab content for each command; defaults to defaultTerminalTabs */
	tabs?: TabContent[];
	/** Background image URL; when unset, BackgroundGradient is used */
	backgroundImage?: string;
	/** Force dark mode for the terminal regardless of page theme */
	alwaysDark?: boolean;
}

const backgroundImage = "/dither.png";

const tabs: TabContent[] = [
	{
		label: "install",
		command: "npm install @crosmos/sdk",
		lines: [
			{ text: "", delay: 80 },
			{
				text: "added 124 packages in 6s",
				color: "text-[#6FF7CC]",
				delay: 400,
			},
			{ text: "", delay: 80 },
			{
				text: "  adding memory to your agent",
				color: "text-slate-400",
				delay: 150,
			},
			{
				text: "    run `npm fund crosmos-ai` for details",
				color: "text-slate-500",
				delay: 100,
			},
			{
				text: "  +-----------------------+",
				color: "text-[#ED42B5]",
				delay: 120,
			},
			{
				text: "  |       crosmos         |",
				color: "text-[#ED42B5]",
				delay: 120,
			},
			{
				text: "  |   coming soon    |",
				color: "text-[#ED42B5]",
				delay: 120,
			},
			{
				text: "  +-----------------------+",
				color: "text-[#ED42B5]",
				delay: 160,
			},
			{ text: "", delay: 80 },
			{
				text: "  found 0 vulnerabilities",
				color: "text-[#ADFA1F]",
				delay: 250,
			},
		],
	},
];

export function TerminalAnimationDemo() {
	const [animationKey, setAnimationKey] = useState(0);

	return (
		<TerminalAnimationRoot
			key={animationKey}
			alwaysDark={true}
			backgroundImage={backgroundImage}
			className="relative flex w-full justify-center overflow-clip bg-background group rounded"
			defaultActiveTab={0}
			hideCursorOnComplete={false}
			tabs={tabs}
		>
			<button
				className="absolute top-4 left-4 z-20 rounded border border-white/25 bg-black/45 px-3 py-1.5 font-mono text-[11px] text-white/90 uppercase tracking-wide transition hover:bg-black/65 opacity-0 group-hover:opacity-100"
				onClick={() => setAnimationKey((prev) => prev + 1)}
				type="button"
			>
				Refresh
			</button>
			<TerminalAnimationContainer>
				<TerminalAnimationWindow className="outline-1 outline-white/30 outline-offset-2">
					<TerminalAnimationContent className="min-h-142">
						<div className="flex items-center gap-2 leading-relaxed">
							<span className="select-none font-mono text-muted-foreground text-xs md:text-sm">
								$
							</span>
							<TerminalAnimationCommandBar className="font-mono text-foreground text-[10px] md:text-sm min-h-[1.5em]" />
						</div>

						<TerminalAnimationOutput
							className="mt-1"
							renderLine={(
								line: TerminalLine,
								_i: number,
								visible: boolean,
							) => {
								if (!visible) {
									return null;
								}
								return (
									<div className="leading-relaxed">
										<span
											className={cn(
												"font-mono text-[10px] md:text-sm",
												line.color ?? "text-muted-foreground",
											)}
										>
											{line.text || "\u00A0"}
										</span>
									</div>
								);
							}}
						/>
						<TerminalAnimationTrailingPrompt className="mt-1 flex items-center gap-2 leading-relaxed">
							<span className="select-none font-mono text-muted-foreground text-sm">
								$
							</span>
							<TerminalAnimationBlinkingCursor />
						</TerminalAnimationTrailingPrompt>
					</TerminalAnimationContent>

					<div className="flex justify-center pb-6">
						<TerminalAnimationTabList className="inline-flex items-center gap-0 rounded border border-border bg-muted/50 px-1 py-1">
							{tabs.map((tab, i) => (
								<TerminalAnimationTabTrigger
									className={cn(
										"cursor-pointer rounded px-3.5 py-1 font-mono text-sm transition-all duration-150",
										"data-[state=active]:bg-primary data-[state=active]:font-medium data-[state=active]:text-primary-foreground",
										"data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground",
									)}
									index={i}
									key={tab.label}
								>
									{tab.label}
								</TerminalAnimationTabTrigger>
							))}
						</TerminalAnimationTabList>
					</div>
				</TerminalAnimationWindow>
			</TerminalAnimationContainer>
		</TerminalAnimationRoot>
	);
}

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
							Stateful, self-improving memory infrastructure for AI agents.
							Memory layer that compounds intelligence — so agents get better,
							not just bigger
						</p>

						<div className="flex flex-col sm:flex-row items-start gap-4">
							<Button className="h-full bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded font-semibold text-base transition-colors flex items-center gap-2">
								Book a Demo
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

				<div className="mt-14 pt-14 border-t border-border flex justify-start items-center gap-20">
					<p className="text-foreground/60 text-lg flex-wrap max-w-64 pr-8">
						Support for most stuff you use daily without any other quirks
					</p>
					<LogoCarousel />
				</div>

				{/* Showcase image section */}
				<div className="mt-14 relative">
					{/*<Image
						// src="/hero-image.png"
						src="/dither.png"
						alt="Crosmos IDE showcase"
						className="w-full rounded shadow-2xl"
						width={500}
						height={500}
					/>*/}
					{/*<video autoPlay muted loop className="w-full rounded shadow-2xl">
						<source src="/dither.mp4" type="video/mp4" />
						Your browser does not support the video tag.
					</video>*/}
					<TerminalAnimationDemo />
				</div>
			</div>
		</section>
	);
}
