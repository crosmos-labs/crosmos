"use client";

import {
	IconClock,
	IconShieldCheck,
	IconTimelineEvent,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const VIEWBOX_W = 520;
const VIEWBOX_H = 400;
const EASE_HOUSE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EPOCHS = ["Q1 2025", "Q2 2025", "Q3 2025"];

type NodeType = "person" | "org" | "tech" | "project" | "concept" | "location";

interface GraphNode {
	id: string;
	name: string;
	type: NodeType;
	edge_count: number;
	cx: number;
	cy: number;
}

interface GraphEdge {
	id: string;
	from: string;
	to: string;
	relation: string;
	epoch: number;
	confidence: number;
}

const NODE_COLORS: Record<NodeType, string> = {
	person: "oklch(0.5544 0.1146 158.24)",
	org: "oklch(0.65 0.09 158)",
	tech: "oklch(0.9 0 0)",
	project: "oklch(0.5 0.07 158)",
	concept: "oklch(0.55 0.03 158)",
	location: "oklch(0.5 0.02 158)",
};

function getRadius(edge_count: number): number {
	return Math.min(4 + edge_count * 0.7, 10);
}

const NODES: GraphNode[] = [
	// People cluster, top-left
	{
		id: "alice",
		name: "Alice Johnson",
		type: "person",
		edge_count: 4,
		cx: 85,
		cy: 62,
	},
	{
		id: "bob",
		name: "Bob Smith",
		type: "person",
		edge_count: 3,
		cx: 175,
		cy: 40,
	},
	{
		id: "carol",
		name: "Carol Williams",
		type: "person",
		edge_count: 3,
		cx: 68,
		cy: 148,
	},
	{
		id: "david",
		name: "David Brown",
		type: "person",
		edge_count: 2,
		cx: 165,
		cy: 125,
	},
	{
		id: "eva",
		name: "Eva Martinez",
		type: "person",
		edge_count: 2,
		cx: 252,
		cy: 58,
	},
	// Organizations, center-left
	{
		id: "acme",
		name: "Acme Corp",
		type: "org",
		edge_count: 5,
		cx: 115,
		cy: 232,
	},
	{
		id: "globex",
		name: "Globex Industries",
		type: "org",
		edge_count: 4,
		cx: 255,
		cy: 215,
	},
	{
		id: "initech",
		name: "Initech Solutions",
		type: "org",
		edge_count: 2,
		cx: 375,
		cy: 192,
	},
	// Projects, center-bottom
	{
		id: "alpha",
		name: "Project Alpha",
		type: "project",
		edge_count: 5,
		cx: 188,
		cy: 318,
	},
	{
		id: "beta",
		name: "Project Beta",
		type: "project",
		edge_count: 3,
		cx: 305,
		cy: 290,
	},
	{
		id: "cnr",
		name: "Cloud Native Refactor",
		type: "project",
		edge_count: 2,
		cx: 415,
		cy: 272,
	},
	// Technologies, right
	{ id: "react", name: "React", type: "tech", edge_count: 4, cx: 395, cy: 105 },
	{
		id: "ts",
		name: "TypeScript",
		type: "tech",
		edge_count: 3,
		cx: 458,
		cy: 165,
	},
	{
		id: "pg",
		name: "PostgreSQL",
		type: "tech",
		edge_count: 2,
		cx: 462,
		cy: 245,
	},
	{
		id: "docker",
		name: "Docker",
		type: "tech",
		edge_count: 2,
		cx: 445,
		cy: 322,
	},
	// Concepts, bottom
	{
		id: "micro",
		name: "Microservices",
		type: "concept",
		edge_count: 2,
		cx: 305,
		cy: 368,
	},
	{
		id: "eda",
		name: "Event-Driven Arch.",
		type: "concept",
		edge_count: 2,
		cx: 415,
		cy: 365,
	},
	// Location, far left
	{
		id: "sf",
		name: "San Francisco",
		type: "location",
		edge_count: 2,
		cx: 22,
		cy: 245,
	},
];

const EDGES: GraphEdge[] = [
	// Epoch 0, Q1 2025: foundational work relationships
	{
		id: "e1",
		from: "alice",
		to: "acme",
		relation: "WORKS_FOR",
		epoch: 0,
		confidence: 0.97,
	},
	{
		id: "e2",
		from: "bob",
		to: "acme",
		relation: "WORKS_FOR",
		epoch: 0,
		confidence: 0.95,
	},
	{
		id: "e3",
		from: "carol",
		to: "globex",
		relation: "WORKS_FOR",
		epoch: 0,
		confidence: 0.93,
	},
	{
		id: "e4",
		from: "david",
		to: "globex",
		relation: "WORKS_FOR",
		epoch: 0,
		confidence: 0.91,
	},
	{
		id: "e5",
		from: "acme",
		to: "alpha",
		relation: "OWNS",
		epoch: 0,
		confidence: 0.99,
	},
	// Epoch 1, Q2 2025: project assignments and tech adoption
	{
		id: "e6",
		from: "alice",
		to: "alpha",
		relation: "ASSIGNED_TO",
		epoch: 1,
		confidence: 0.88,
	},
	{
		id: "e7",
		from: "bob",
		to: "alpha",
		relation: "ASSIGNED_TO",
		epoch: 1,
		confidence: 0.87,
	},
	{
		id: "e8",
		from: "alpha",
		to: "react",
		relation: "USES",
		epoch: 1,
		confidence: 0.92,
	},
	{
		id: "e9",
		from: "alpha",
		to: "ts",
		relation: "USES",
		epoch: 1,
		confidence: 0.92,
	},
	{
		id: "e10",
		from: "react",
		to: "ts",
		relation: "COMPATIBLE_WITH",
		epoch: 1,
		confidence: 0.96,
	},
	// Epoch 2, Q3 2025: concepts, tech chains, collaboration
	{
		id: "e11",
		from: "alpha",
		to: "micro",
		relation: "IMPLEMENTS",
		epoch: 2,
		confidence: 0.82,
	},
	{
		id: "e12",
		from: "beta",
		to: "eda",
		relation: "IMPLEMENTS",
		epoch: 2,
		confidence: 0.79,
	},
	{
		id: "e13",
		from: "alice",
		to: "carol",
		relation: "COLLABORATES_WITH",
		epoch: 2,
		confidence: 0.84,
	},
	{
		id: "e14",
		from: "ts",
		to: "pg",
		relation: "COMPATIBLE_WITH",
		epoch: 2,
		confidence: 0.88,
	},
	{
		id: "e15",
		from: "cnr",
		to: "docker",
		relation: "USES",
		epoch: 2,
		confidence: 0.9,
	},
];

const POINTS: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	description: string;
}[] = [
	{
		icon: IconClock,
		title: "Temporal Validity",
		description:
			"Every relationship is timestamped. Track when organizational facts became true and query the graph at any point in time.",
	},
	{
		icon: IconTimelineEvent,
		title: "Point-in-Time Queries",
		description:
			'Ask "what did we know as of Q3?" Crosmos returns the graph as it existed at that moment, not today\'s version.',
	},
	{
		icon: IconShieldCheck,
		title: "Complete Audit History",
		description:
			"Every memory, entity, and edge is preserved with full temporal provenance. Compliance-ready by design.",
	},
];

interface TooltipState {
	node: GraphNode;
	x: number;
	y: number;
}

function MTKGVisual({ reducedMotion }: { reducedMotion: boolean }) {
	const [epochIndex, setEpochIndex] = useState(0);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		const id = setInterval(() => setEpochIndex((e) => (e + 1) % 3), 2200);
		return () => clearInterval(id);
	}, []);

	const nodeMap = new Map(NODES.map((n) => [n.id, n]));

	const handleNodeEnter = (node: GraphNode) => {
		if (!svgRef.current || !wrapperRef.current) return;
		const svgRect = svgRef.current.getBoundingClientRect();
		const wrapperRect = wrapperRef.current.getBoundingClientRect();
		const scaleX = svgRect.width / VIEWBOX_W;
		const scaleY = svgRect.height / VIEWBOX_H;
		const x = node.cx * scaleX + (svgRect.left - wrapperRect.left);
		const y = node.cy * scaleY + (svgRect.top - wrapperRect.top);
		setTooltip({ node, x, y });
	};

	return (
		<div
			ref={wrapperRef}
			className="relative w-full rounded-xl bg-[oklch(0.18_0_0)]"
		>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
				className="w-full h-auto"
				role="img"
				aria-label="Monotonic Temporal Knowledge Graph showing organizational entities and relationships across time"
			>
				<defs>
					<marker
						id="mtkg-arrow"
						markerWidth="5"
						markerHeight="5"
						refX="4.5"
						refY="2.5"
						orient="auto"
					>
						<path d="M0,0.5 L5,2.5 L0,4.5 L1.2,2.5 z" fill="var(--accent)" />
					</marker>
				</defs>

				{/* Edges */}
				{EDGES.map((edge) => {
					const src = nodeMap.get(edge.from);
					const tgt = nodeMap.get(edge.to);
					if (!src || !tgt) return null;

					const isActive = edge.epoch === epochIndex;
					const opacity = isActive ? 0.55 : 0.07;

					// Direction unit vector
					const dx = tgt.cx - src.cx;
					const dy = tgt.cy - src.cy;
					const dist = Math.sqrt(dx * dx + dy * dy);
					const srcR = getRadius(src.edge_count);
					const tgtR = getRadius(tgt.edge_count);

					// Offset start/end to sit at node boundaries
					const startX = src.cx + (dx / dist) * (srcR + 1);
					const startY = src.cy + (dy / dist) * (srcR + 1);
					const endX = tgt.cx - (dx / dist) * (tgtR + 5);
					const endY = tgt.cy - (dy / dist) * (tgtR + 5);

					// Quadratic bezier with perpendicular curve offset
					const perpX = -dy / dist;
					const perpY = dx / dist;
					const midX = (startX + endX) / 2 + perpX * 14;
					const midY = (startY + endY) / 2 + perpY * 14;

					const strokeW = Math.max(0.6, edge.confidence * 1.5);

					return (
						<motion.path
							key={edge.id}
							d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
							stroke="var(--accent)"
							strokeWidth={strokeW}
							fill="none"
							markerEnd="url(#mtkg-arrow)"
							animate={{ opacity }}
							transition={
								reducedMotion
									? { duration: 0 }
									: { duration: 0.65, ease: EASE_HOUSE }
							}
						/>
					);
				})}

				{/* Nodes */}
				{NODES.map((node, i) => {
					const r = getRadius(node.edge_count);
					const color = NODE_COLORS[node.type];

					return (
						// Static translate wrapper so scale animates from node center
						<g key={node.id} transform={`translate(${node.cx} ${node.cy})`}>
							<motion.g
								style={{ cursor: "pointer" }}
								initial={reducedMotion ? false : { opacity: 0, scale: 0 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{
									duration: 0.45,
									delay: i * 0.03,
									ease: EASE_HOUSE,
								}}
								onHoverStart={() => handleNodeEnter(node)}
								onHoverEnd={() => setTooltip(null)}
							>
								<circle cx={0} cy={0} r={r} fill={color} />
								{/* Entity name below */}
								<text
									x={0}
									y={r + 9}
									fill="oklch(0.75 0 0)"
									fontSize={6.5}
									fontFamily="'Geist Mono', monospace"
									textAnchor="middle"
									pointerEvents="none"
								>
									{node.name}
								</text>
								{/* Type badge above */}
								<text
									x={0}
									y={-r - 4}
									fill="oklch(0.45 0 0)"
									fontSize={5}
									fontFamily="'Geist Mono', monospace"
									textAnchor="middle"
									pointerEvents="none"
								>
									{node.type}
								</text>
							</motion.g>
						</g>
					);
				})}

				{/* Epoch label, bottom-right, fades in on epoch change */}
				<motion.g
					key={epochIndex}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<text
						x={VIEWBOX_W - 10}
						y={VIEWBOX_H - 10}
						fill="var(--accent)"
						fontSize={8}
						fontFamily="'Geist Mono', monospace"
						textAnchor="end"
					>
						{EPOCHS[epochIndex]}
					</text>
				</motion.g>
			</svg>

			{/* Hover tooltip, absolute within wrapperRef */}
			{tooltip && (
				<div
					className="absolute pointer-events-none z-10 bg-foreground/90 text-background text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap"
					style={{
						left: tooltip.x,
						top: tooltip.y,
						transform: "translate(-50%, calc(-100% - 10px))",
					}}
				>
					<div className="font-semibold leading-tight">{tooltip.node.name}</div>
					<div className="opacity-60 font-mono text-[10px] capitalize mt-0.5">
						{tooltip.node.type}
					</div>
					<div className="opacity-60 text-[10px]">
						{tooltip.node.edge_count} connections
					</div>
				</div>
			)}
		</div>
	);
}

export function Mtkg() {
	const reducedMotion = useReducedMotion() ?? false;

	return (
		<section
			id="mtkg"
			className="relative px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
					{/* Left: content */}
					<div>
						<p className="text-primary font-mono font-bold uppercase mb-4">
							[ Monotonic Temporal Knowledge Graph ]
						</p>
						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
							Context loss compounds. So should your graph.
						</h2>
						<p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
							Teams change. Projects evolve. Decisions get made and forgotten.
							Crosmos builds a living knowledge graph that captures not just
							what your organization knows, but when it knew it. Every memory,
							entity, and relationship is timestamped and versioned. Query your
							graph as it was last quarter, last year, or the moment a fact was
							first learned. Nothing is ever lost.
						</p>

						<div className="mt-10 sm:mt-12 space-y-6">
							{POINTS.map(({ icon: Icon, title, description }) => (
								<div key={title} className="flex gap-4">
									<div className="flex-shrink-0 mt-0.5">
										<Icon className="size-5 text-primary" />
									</div>
									<div>
										<h3 className="font-semibold text-foreground">{title}</h3>
										<p className="mt-1 text-sm text-muted-foreground leading-relaxed">
											{description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Right: graph canvas */}
					<div>
						<MTKGVisual reducedMotion={reducedMotion} />
					</div>
				</div>
			</div>
		</section>
	);
}
