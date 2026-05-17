"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { IconDatabase, IconNetwork, IconSearch } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const steps = [
	{
		number: "01",
		icon: IconDatabase,
		title: "Ingest",
		description:
			"Send conversations or any content. Crosmos extracts contextual memories, entities, and structured relations automatically.",
	},
	{
		number: "02",
		icon: IconNetwork,
		title: "Build a Knowledge Graph",
		description:
			"Extracted knowledge forms a Monotonic Temporal Knowledge Graph (MTKG): a time-aware graph that never loses history. Every memory, entity, and relation is timestamped and versioned.",
	},
	{
		number: "03",
		icon: IconSearch,
		title: "Retrieve with Precision",
		description:
			"Multi-signal hybrid retrieval combines semantic search, keyword matching, and graph traversal: fused and ranked deterministically. No LLM calls at query time. Fast, predictable, auditable.",
	},
];

const graphNodes = [
	// Cluster 1: Big cluster at bottom-left (hub at 220,260, ~30 nodes)
	{ id: 0, cx: 220, cy: 260, r: 8, hub: true },
	{ id: 1, cx: 120, cy: 190, r: 4 },
	{ id: 2, cx: 70, cy: 230, r: 3.5 },
	{ id: 3, cx: 40, cy: 290, r: 3.5 },
	{ id: 4, cx: 80, cy: 350, r: 3.5 },
	{ id: 5, cx: 150, cy: 400, r: 3.5 },
	{ id: 6, cx: 230, cy: 410, r: 3.5 },
	{ id: 7, cx: 310, cy: 390, r: 3.5 },
	{ id: 8, cx: 370, cy: 340, r: 3 },
	{ id: 9, cx: 360, cy: 260, r: 3.5 },
	{ id: 10, cx: 320, cy: 180, r: 3.5 },
	{ id: 11, cx: 260, cy: 130, r: 3 },
	{ id: 12, cx: 180, cy: 110, r: 3 },
	{ id: 13, cx: 30, cy: 160, r: 3 },
	{ id: 14, cx: 10, cy: 260, r: 3 },
	{ id: 15, cx: 20, cy: 350, r: 3 },
	{ id: 16, cx: 120, cy: 420, r: 3 },
	{ id: 17, cx: 390, cy: 270, r: 3 },
	{ id: 18, cx: 160, cy: 310, r: 3 },
	{ id: 19, cx: 280, cy: 310, r: 3 },
	{ id: 20, cx: 100, cy: 280, r: 3 },
	{ id: 21, cx: 200, cy: 180, r: 3 },
	{ id: 22, cx: 300, cy: 240, r: 3 },
	{ id: 23, cx: 140, cy: 150, r: 3 },
	{ id: 24, cx: 50, cy: 200, r: 3 },
	{ id: 25, cx: 60, cy: 320, r: 3 },
	{ id: 26, cx: 340, cy: 310, r: 3 },
	{ id: 27, cx: 250, cy: 350, r: 3 },
	{ id: 28, cx: 170, cy: 230, r: 3 },
	{ id: 29, cx: 290, cy: 160, r: 3 },

	// Cluster 2: Small cluster at top-right (hub at 520,100, ~12 nodes)
	{ id: 30, cx: 520, cy: 100, r: 7, hub: true },
	{ id: 31, cx: 460, cy: 50, r: 3 },
	{ id: 32, cx: 455, cy: 120, r: 3.5 },
	{ id: 33, cx: 580, cy: 60, r: 3 },
	{ id: 34, cx: 590, cy: 130, r: 3 },
	{ id: 35, cx: 500, cy: 160, r: 3 },
	{ id: 36, cx: 540, cy: 170, r: 3 },
	{ id: 37, cx: 440, cy: 80, r: 3 },
	{ id: 38, cx: 480, cy: 40, r: 3 },
	{ id: 39, cx: 560, cy: 150, r: 3 },
	{ id: 40, cx: 470, cy: 150, r: 3 },
	{ id: 41, cx: 600, cy: 100, r: 3 },
];

const graphEdges = [
	// Cluster 1 edges
	{ from: 0, to: 1, crossCluster: false },
	{ from: 0, to: 2, crossCluster: false },
	{ from: 0, to: 3, crossCluster: false },
	{ from: 0, to: 4, crossCluster: false },
	{ from: 0, to: 5, crossCluster: false },
	{ from: 0, to: 6, crossCluster: false },
	{ from: 0, to: 7, crossCluster: false },
	{ from: 0, to: 8, crossCluster: false },
	{ from: 0, to: 9, crossCluster: false },
	{ from: 0, to: 10, crossCluster: false },
	{ from: 0, to: 11, crossCluster: false },
	{ from: 0, to: 12, crossCluster: false },
	{ from: 0, to: 13, crossCluster: false },
	{ from: 0, to: 14, crossCluster: false },
	{ from: 0, to: 15, crossCluster: false },
	{ from: 0, to: 16, crossCluster: false },
	{ from: 0, to: 17, crossCluster: false },
	{ from: 0, to: 18, crossCluster: false },
	{ from: 0, to: 19, crossCluster: false },
	{ from: 0, to: 20, crossCluster: false },
	{ from: 0, to: 21, crossCluster: false },
	{ from: 0, to: 22, crossCluster: false },
	{ from: 0, to: 23, crossCluster: false },
	{ from: 0, to: 24, crossCluster: false },
	{ from: 0, to: 25, crossCluster: false },
	{ from: 0, to: 26, crossCluster: false },
	{ from: 0, to: 27, crossCluster: false },
	{ from: 0, to: 28, crossCluster: false },
	{ from: 0, to: 29, crossCluster: false },

	// Cluster 2 edges
	{ from: 30, to: 31, crossCluster: false },
	{ from: 30, to: 32, crossCluster: false },
	{ from: 30, to: 33, crossCluster: false },
	{ from: 30, to: 34, crossCluster: false },
	{ from: 30, to: 35, crossCluster: false },
	{ from: 30, to: 36, crossCluster: false },
	{ from: 30, to: 37, crossCluster: false },
	{ from: 30, to: 38, crossCluster: false },
	{ from: 30, to: 39, crossCluster: false },
	{ from: 30, to: 40, crossCluster: false },
	{ from: 30, to: 41, crossCluster: false },

	// Inter-cluster edges (weak)
	{ from: 0, to: 30, crossCluster: true },
	{ from: 9, to: 32, crossCluster: true },
	{ from: 10, to: 37, crossCluster: true },
];

export function KnowledgeGraphVisual({ reducedMotion }: { reducedMotion: boolean }) {
	const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
	const [isGraphHovered, setIsGraphHovered] = useState(false);

	const connectedNodeIds = new Set<number>();
	const connectedEdgeKeys = new Set<string>();
	if (hoveredNodeId !== null) {
		connectedNodeIds.add(hoveredNodeId);
		for (const edge of graphEdges) {
			if (edge.from === hoveredNodeId || edge.to === hoveredNodeId) {
				connectedNodeIds.add(edge.from);
				connectedNodeIds.add(edge.to);
				connectedEdgeKeys.add(`${edge.from}-${edge.to}`);
			}
		}
	}

	const isNodeHighlighted = (id: number) =>
		hoveredNodeId === null || connectedNodeIds.has(id);
	const isEdgeHighlighted = (from: number, to: number) =>
		hoveredNodeId === null || connectedEdgeKeys.has(`${from}-${to}`);

	return (
		<div className="w-full max-w-3xl mx-auto rounded-xl border border-foreground/10 overflow-hidden bg-[oklch(0.2_0_0)]">
			<div
				className={cn(
					"flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 transition-colors",
					isGraphHovered ? "bg-foreground/[0.06]" : "bg-transparent",
				)}
			>
				<div className="flex gap-1.5">
					<div
						className={cn(
							"size-2.5 rounded-full transition-colors",
							isGraphHovered ? "bg-red-600" : "bg-zinc-600",
						)}
					/>
					<div
						className={cn(
							"size-2.5 rounded-full transition-colors",
							isGraphHovered ? "bg-yellow-600" : "bg-zinc-600",
						)}
					/>
					<div
						className={cn(
							"size-2.5 rounded-full transition-colors",
							isGraphHovered ? "bg-green-600" : "bg-zinc-600",
						)}
					/>
				</div>
			</div>
			<div
				className="pt-4 px-0 pb-0 sm:pt-6"
				tabIndex={0}
				role="region"
				aria-label="Interactive knowledge graph"
				onMouseEnter={() => setIsGraphHovered(true)}
				onMouseLeave={() => {
					setIsGraphHovered(false);
					setHoveredNodeId(null);
				}}
				onFocus={() => setIsGraphHovered(true)}
				onBlur={() => {
					setIsGraphHovered(false);
					setHoveredNodeId(null);
				}}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						setIsGraphHovered(false);
						setHoveredNodeId(null);
					}
				}}
			>
				<svg
					viewBox="-10 -10 640 460"
					className="w-full h-auto"
					role="img"
					aria-label="Knowledge graph visualization showing connected entities"
				>
					<defs>
						<filter id="glow">
							<feGaussianBlur stdDeviation="2" result="blur" />
							<feMerge>
								<feMergeNode in="blur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>

					{graphEdges.map((edge, i) => {
						const fromNode = graphNodes[edge.from]!;
						const toNode = graphNodes[edge.to]!;
						const highlighted = isEdgeHighlighted(edge.from, edge.to);
						const baseOpacity = edge.crossCluster ? 0.04 : 0.08;
						const highlightOpacity = edge.crossCluster ? 0.2 : 0.35;

						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: static graph edges
							<g key={i}>
								<motion.line
									x1={fromNode.cx}
									y1={fromNode.cy}
									x2={toNode.cx}
									y2={toNode.cy}
									stroke="var(--accent)"
									strokeWidth={edge.crossCluster ? 0.8 : 1.2}
									strokeDasharray={edge.crossCluster ? "2 6" : "2 5"}
									initial={{
										pathLength: reducedMotion ? 1 : 0,
										strokeOpacity: reducedMotion ? baseOpacity : 0,
									}}
									animate={{
										pathLength: 1,
										strokeOpacity: highlighted ? highlightOpacity : baseOpacity,
									}}
									transition={{
										pathLength: {
											duration: 0.8,
											delay: 0.2 + i * 0.04,
											ease: "easeOut",
										},
										strokeOpacity: { duration: 0.3, ease: "easeOut" },
									}}
									style={{ pathLength: 1 as unknown as number }}
								/>
								{!reducedMotion && (
									<motion.line
										x1={fromNode.cx}
										y1={fromNode.cy}
										x2={toNode.cx}
										y2={toNode.cy}
										stroke="var(--accent)"
										strokeWidth={edge.crossCluster ? 1.5 : 2}
										strokeDasharray={edge.crossCluster ? "4 40" : "6 50"}
										strokeOpacity={edge.crossCluster ? 0.08 : 0.12}
										strokeLinecap="round"
										animate={{
											strokeDashoffset: [0, edge.crossCluster ? -44 : -56],
										}}
										transition={{
											duration: edge.crossCluster ? 8 : 6,
											repeat: Number.POSITIVE_INFINITY,
											ease: "linear",
											delay: i * 0.3,
										}}
									/>
								)}
							</g>
						);
					})}

					{graphNodes.map((node, i) => (
						<motion.g
							// biome-ignore lint/suspicious/noArrayIndexKey: static graph nodes
							key={node.id}
							initial={
								reducedMotion
									? { scale: 1, opacity: 1 }
									: { scale: 0, opacity: 0 }
							}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								duration: 0.4,
								delay: 0.1 + i * 0.02,
								ease: "easeOut",
							}}
							onHoverStart={() => setHoveredNodeId(node.id)}
							onHoverEnd={() => setHoveredNodeId(null)}
							style={{ cursor: "pointer" }}
						>
							<motion.circle
								cx={node.cx}
								cy={node.cy}
								r={node.r}
								fill="var(--accent)"
								initial={{ opacity: isNodeHighlighted(node.id) ? 1 : 0.15 }}
								animate={{
									opacity: isNodeHighlighted(node.id) ? 1 : 0.15,
								}}
								transition={{ duration: 0.25, ease: "easeOut" }}
								filter={node.hub ? "url(#glow)" : undefined}
							/>
							{node.hub && (
								<motion.circle
									cx={node.cx}
									cy={node.cy}
									r={reducedMotion ? node.r + 3 : undefined}
									fill="none"
									stroke="var(--accent)"
									initial={{
										strokeOpacity: isNodeHighlighted(node.id) ? 0.2 : 0,
									}}
									animate={
										reducedMotion
											? {
													strokeOpacity: isNodeHighlighted(node.id) ? 0.2 : 0,
													r: node.r + 3,
												}
											: {
													r: [node.r + 1, node.r + 6, node.r + 1],
													strokeOpacity: [0.3, 0, 0.3],
												}
									}
									transition={
										reducedMotion
											? { duration: 0.25, ease: "easeOut" }
											: {
													duration: 3,
													delay: 1.5 + i * 0.2,
													repeat: Number.POSITIVE_INFINITY,
													ease: "easeInOut",
												}
									}
								/>
							)}
						</motion.g>
					))}
				</svg>
			</div>
		</div>
	);
}

export function HowItWorks() {
	const reducedMotion = useReducedMotion() ?? false;

	return (
		<section
			id="how-it-works"
			className="relative px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<motion.p
					initial={reducedMotion ? false : { opacity: 0, y: 12 }}
					whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
					viewport={reducedMotion ? undefined : { once: true, margin: "-80px" }}
					transition={reducedMotion ? undefined : { duration: 0.5 }}
					className="text-accent font-mono font-bold uppercase text-center mb-4"
				>
					[ How It Works ]
				</motion.p>

				<motion.h2
					initial={reducedMotion ? false : { opacity: 0, y: 16 }}
					whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
					viewport={reducedMotion ? undefined : { once: true, margin: "-80px" }}
					transition={reducedMotion ? undefined : { duration: 0.5, delay: 0.1 }}
					className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 sm:mb-14 lg:mb-16 text-center"
				>
					From Content to Knowledge
				</motion.h2>

				<div className="mb-12 sm:mb-16">
					<KnowledgeGraphVisual reducedMotion={reducedMotion} />
				</div>

				<div className="max-w-2xl mx-auto relative">
					<div className="absolute left-5 top-0 bottom-0 w-px bg-transparent">
						<div className="absolute top-[1.25rem] bottom-[5.5rem] left-0 w-px bg-foreground/10" />
					</div>

					{steps.map((step, i) => {
						const Icon = step.icon;
						return (
							<motion.div
								// biome-ignore lint/suspicious/noArrayIndexKey: ordered steps
								key={i}
								initial={reducedMotion ? false : { opacity: 0, x: -20 }}
								whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
								viewport={reducedMotion ? undefined : { once: true, margin: "-60px" }}
								transition={reducedMotion ? undefined : { duration: 0.5, delay: i * 0.15 }}
								className="relative flex gap-6 pb-12 last:pb-0"
							>
								<div className="relative z-10 flex-shrink-0">
									<div className="flex items-center justify-center size-10 rounded-full bg-accent/10 border-2 border-accent/30">
										<span className="text-xs font-mono font-bold text-accent">
											{step.number}
										</span>
									</div>
								</div>

								<div className="pt-1.5">
									<div className="flex items-center gap-2.5 mb-2">
										<Icon className="size-5 text-accent" />
										<h3 className="text-lg sm:text-xl font-semibold text-foreground">
											{step.title}
										</h3>
									</div>
									<p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
										{step.description}
									</p>
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
