"use client";

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

export interface TerminalAnimationDemoProps {
	tabs?: TabContent[];
	backgroundImage?: string;
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
				color: "text-slate-400",
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
				text: "  found 0 vulnerability",
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
