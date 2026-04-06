"use client";

import Image from "next/image";
import { useState } from "react";
import { DecryptCodeSnippet } from "./ui/syntax-highlighter";

const CODE_SNIPPETS: Record<string, { language: string; lines: string[] }> = {
	nodejs: {
		language: "javascript",
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

export function Example() {
	const [selected, setSelected] = useState("nodejs");

	const tabs = [
		{ label: "NodeJS", value: "nodejs" },
		{ label: "Python", value: "python" },
		{ label: "cURL", value: "curl" },
	];

	return (
		<section className="py-24 px-6">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">
					Example
				</h2>

				<div className="grid grid-rows-1 min-h-125 grid-cols-5 gap-8">
					<div className="col-span-2 flex flex-col gap-10">
						<div className="px-12 space-y-4">
							<h1 className="font-bold text-4xl">
								Purchase, upgrade, downgrade
							</h1>
							<p className="text-wrap">
								One call connects users to plans. Stripe checkout, webhooks, and
								entitlement activation all handled.
							</p>
						</div>
						<div className="w-full flex px-12">
							{tabs.map((tab) => (
								<button
									key={tab.value}
									className="flex-1 py-2 transition-colors duration-100 font-mono text-xs data-[state=active]:bg-accent data-[state=active]:text-primary-foreground data-[state=inactive]:text-muted-foreground"
									data-state={selected === tab.value ? "active" : "inactive"}
									onClick={() => setSelected(tab.value)}
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
						<div className="absolute bottom-0 right-0 top-12 left-12">
							<div className="relative w-full h-full bg-black/65 backdrop-blur-lg border-l border-t border-white/10 shadow-2xl font-mono leading-relaxed group rounded-t rounded-r-0">
								<div className="flex items-center gap-1.5 px-5 py-4 border-b border-white/10">
									<div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-red-400 transition-colors" />
									<div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-yellow-400 transition-colors" />
									<div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-green-400 transition-colors" />
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
