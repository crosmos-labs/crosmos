"use client";

import { cn } from "@crosmos/ui/lib/utils";
import Image from "next/image";
import { useState } from "react";

function CodeEditor() {
	return (
		<div className="relative w-full bg-black/65 backdrop-blur-lg border-l border-t border-white/10 shadow-2xl font-mono text-[13px] leading-relaxed group rounded-t rounded-r-0 text-white">
			<div className="flex items-center gap-1.5 px-5 py-4 border-b border-white/10">
				<div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-red-400 transition-colors" />
				<div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-yellow-400 transition-colors" />
				<div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-green-400 transition-colors" />
			</div>
			<div className="px-8 pb-10 pt-6 space-y-8">
				<div>
					<div className="text-[#888] font-medium">
						{"//"} 1. attach() - Handle purchases,
					</div>
					<div className="text-[#888] font-medium">upgrades, downgrades</div>
					<div className="mt-2">
						<span className="text-[#c678dd]">const</span> {"{ checkout }"} ={" "}
						<span className="text-[#61afef]">useAutumn</span>();
					</div>
					<div className="mt-1">
						<span className="text-[#c678dd]">await</span>{" "}
						<span className="text-[#61afef]">checkout</span>({"{"}{" "}
						<span className="text-[#d19a66]">productId</span>:{" "}
						<span className="text-[#98c379]">"pro"</span> {"});"}
					</div>
				</div>

				<div>
					<div className="text-[#888] font-medium">
						{"//"} 2. check() - Verify access and
					</div>
					<div className="text-[#888] font-medium">remaining usage</div>
					<div className="mt-2">
						<span className="text-[#c678dd]">const</span> {"{ data }"} ={" "}
						<span className="text-[#c678dd]">await</span>{" "}
						<span className="text-[#61afef]">check</span>({"{"}
					</div>
					<div className="ml-4 mt-1">
						<span className="text-[#d19a66]">featureId</span>:{" "}
						<span className="text-[#98c379]">"ai_tokens"</span> {"});"}
					</div>
					<div className="mt-1">
						<span className="text-[#c678dd]">if</span> (!data.allowed){" "}
						<span className="text-[#c678dd]">return</span>{" "}
						<span className="text-[#98c379]">"Limit reached"</span>{";"}
					</div>
				</div>

				<div>
					<div className="text-[#888] font-medium">
						{"//"} 3. track() - Record usage events
					</div>
					<div className="mt-2">
						<span className="text-[#c678dd]">await</span>{" "}
						<span className="text-[#61afef]">track</span>({"{"}{" "}
						<span className="text-[#d19a66]">featureId</span>:
					</div>
					<div className="mt-1">
						<span className="text-[#98c379]">"ai_tokens"</span>,{" "}
						<span className="text-[#d19a66]">value</span>:{" "}
						<span className="text-[#d19a66]">1312</span> {"});"}
					</div>
				</div>
			</div>
		</div>
	);
}

export function Example() {
	const [selected, setSelected] = useState("typescript");

	const tabs = [{ label: "typescript" }, { label: "python" }, { label: "api" }];

	return (
		<section className="py-24 px-6">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">
					Example
				</h2>

				<div className="grid grid-rows-1 min-h-125 grid-cols-5 gap-8">
					<div className="col-span-2 flex flex-col">
						<div className="flex-1 px-12 space-y-4">
							<h1 className="font-bold text-4xl">
								Purchase, upgrade, downgrade
							</h1>
							<p className="text-wrap">
								One call connects users to plans. Stripe checkout, webhooks, and
								entitlement activation all handled.
							</p>
						</div>
						<div className="w-full flex px-3">
							{tabs.map((tab) => (
								<button
									key={tab.label}
									className={cn(
										"flex-1 py-2 transition-colors duration-100 font-mono text-xs",
										selected === tab.label &&
											"bg-accent text-primary-foreground",
									)}
									onClick={() => setSelected(tab.label)}
								>
									{tab.label}
								</button>
							))}
						</div>
					</div>
					<div className="relative size-full col-span-3 flex items-end justify-end overflow-hidden">
						<Image
							src="/hero-image.png"
							alt="code bg"
							width={500}
							height={500}
							className="size-full object-cover select-none"
							draggable={false}
						/>
						<div className="absolute -bottom-1 -right-1 max-w-[80%] w-full">
							<CodeEditor />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
