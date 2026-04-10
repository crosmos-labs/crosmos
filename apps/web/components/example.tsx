"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

const DecryptCodeSnippet = dynamic(
	() => import("./ui/syntax-highlighter").then((m) => m.DecryptCodeSnippet),
	{ ssr: false },
);

const CODE_SNIPPETS: Record<string, { language: string; lines: string[] }> = {
	typescript: {
		language: "typescript",
		lines: [
			'import { Crosmos } from "@crosmos/sdk";',
			"",
			"const crosmos = new Crosmos({",
			"  apiKey: process.env.CROSMOS_API_KEY",
			"});",
			"",
			"// 1. Store a memory",
			"const memory = await crosmos.memories.create({",
			'  content: "User prefers dark mode",',
			'  agentId: "my-agent"',
			"});",
			"",
			"// 2. Search memories",
			"const results = await crosmos.memories.search({",
			'  query: "user preferences",',
			'  agentId: "my-agent"',
			"});",
		],
	},
	python: {
		language: "python",
		lines: [
			"from crosmos import Crosmos",
			"",
			"crosmos = Crosmos(",
			'  api_key=os.environ["CROSMOS_API_KEY"]',
			")",
			"",
			"# 1. Store a memory",
			"memory = crosmos.memories.create(",
			'  content="User prefers dark mode",',
			'  agent_id="my-agent"',
			")",
			"",
			"# 2. Search memories",
			"results = crosmos.memories.search(",
			'  query="user preferences",',
			'  agent_id="my-agent"',
			")",
		],
	},
	curl: {
		language: "bash",
		lines: [
			"# 1. Store a memory",
			"curl -X POST https://api.crosmos.dev/v1/memories \\",
			'  -H "Authorization: Bearer $CROSMOS_API_KEY" \\',
			'  -H "Content-Type: application/json" \\',
			'  -d \'{"content": "User prefers dark mode",',
			'       "agentId": "my-agent"}\'',
			"",
			"# 2. Search memories",
			"curl -X POST https://api.crosmos.dev/v1/memories/search \\",
			'  -H "Authorization: Bearer $CROSMOS_API_KEY" \\',
			'  -H "Content-Type: application/json" \\',
			'  -d \'{"query": "user preferences",',
			'       "agentId": "my-agent"}\'',
		],
	},
};

const TABS = [
	{ label: "Typescript", value: "typescript" },
	{ label: "Python", value: "python" },
	{ label: "cURL", value: "curl" },
];

export function Example() {
	const [selected, setSelected] = useState("typescript");
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const focusTab = useCallback((index: number) => {
		const tab = tabRefs.current[index];
		tab?.focus();
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const currentIndex = TABS.findIndex((t) => t.value === selected);
			let nextIndex: number;

			switch (e.key) {
				case "ArrowRight":
					e.preventDefault();
					nextIndex = (currentIndex + 1) % TABS.length;
					setSelected(TABS[nextIndex]?.value);
					focusTab(nextIndex);
					break;
				case "ArrowLeft":
					e.preventDefault();
					nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
					setSelected(TABS[nextIndex]?.value);
					focusTab(nextIndex);
					break;
				case "Home":
					e.preventDefault();
					setSelected(TABS[0]?.value);
					focusTab(0);
					break;
				case "End":
					e.preventDefault();
					setSelected(TABS[TABS.length - 1]?.value);
					focusTab(TABS.length - 1);
					break;
			}
		},
		[selected, focusTab],
	);

	return (
		<section className="px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 sm:mb-16 lg:mb-20 text-center">
					Example
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0 md:min-h-125">
					<div className="md:col-span-2 flex flex-col justify-between border-foreground/10 border-2 rounded">
						<div className="px-6 py-6 md:px-12 md:pt-12 space-y-4">
							<h3 className="font-bold text-2xl sm:text-3xl md:text-4xl">
								Purchase, upgrade, downgrade
							</h3>
							<p className="text-wrap">
								One call connects users to plans. Stripe checkout, webhooks, and
								entitlement activation all handled.
							</p>
						</div>
						<div
							className="w-full flex border-t-2 border-foreground/10 divide-x-2 divide-foreground/10"
							role="tablist"
							aria-label="Code language"
						>
							{TABS.map((tab, i) => (
								<button
									key={tab.value}
									ref={(el) => {
										tabRefs.current[i] = el;
									}}
									role="tab"
									id={`tab-${tab.value}`}
									aria-selected={selected === tab.value}
									aria-controls="tabpanel-example"
									tabIndex={selected === tab.value ? 0 : -1}
									className="flex-1 py-2 transition-colors duration-100 font-mono text-xs data-[state=active]:bg-accent data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
									data-state={selected === tab.value ? "active" : "inactive"}
									onClick={() => setSelected(tab.value)}
									onKeyDown={handleKeyDown}
								>
									{tab.label}
								</button>
							))}
						</div>
					</div>
					<div
						id="tabpanel-example"
						className="relative md:col-span-3 aspect-[4/5] sm:aspect-video md:aspect-auto md:size-full -mx-6 md:mx-0 flex items-end justify-end overflow-hidden"
						role="tabpanel"
						aria-labelledby={`tab-${selected}`}
					>
						<Image
							src="/hero-image.webp"
							alt="code bg"
							fill
							sizes="(max-width: 768px) 100vw, 60vw"
							className="object-cover select-none"
							style={{ width: "100%", height: "100%" }}
							draggable={false}
							loading="lazy"
						/>
						<div className="absolute bottom-0 right-0 top-6 left-0 sm:top-4 md:top-12 md:left-12">
							<div className="relative w-full h-full bg-black/65 backdrop-blur-lg border-l border-t border-white/10 shadow-2xl font-mono leading-relaxed group rounded-t rounded-r-0">
								<div className="flex items-center gap-1.5 px-3 py-2 sm:px-5 sm:py-4 border-b border-white/10">
									<div className="size-2 rounded-full bg-red-400 md:bg-white/20 md:group-hover:bg-red-400 transition-colors" />
									<div className="size-2 rounded-full bg-yellow-400 md:bg-white/20 md:group-hover:bg-yellow-400 transition-colors" />
									<div className="size-2 rounded-full bg-green-400 md:bg-white/20 md:group-hover:bg-green-400 transition-colors" />
								</div>
								<DecryptCodeSnippet
									codeLines={CODE_SNIPPETS[selected]?.lines ?? []}
									language={CODE_SNIPPETS[selected]?.language ?? "javascript"}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
