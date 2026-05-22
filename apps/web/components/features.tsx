"use client";

import { motion } from "motion/react";
import type { ComponentType } from "react";

const VIEW = { w: 320, h: 180 };

// ----------------------------------------------------------------------------
// Shared helpers
// ----------------------------------------------------------------------------

const MONO_FONT = "var(--font-jetbrains-mono, monospace)";
const TEXT_MUTED = "var(--muted-foreground)";
const TEXT_FG = "var(--foreground)";

// transitions-dev easings (mirror --resize-ease, --check-ease-bob, etc.)
const EASE_HOUSE = [0.22, 1, 0.36, 1] as const; // default: resize, dropdown, modal, panel
const EASE_BOB = [0.34, 1.35, 0.64, 1] as const; // success check bob (bouncy)

// transitions-dev "premium opacity" pattern: blur + translateY paired with opacity
const TEXT_SWAP_BLUR = 2; // px — matches --text-swap-blur
const TEXT_SWAP_DY = 4; // px — matches --text-swap-translate-y

function MonoLabel({
	x,
	y,
	text,
	opacity = 1,
	anchor = "start",
}: {
	x: number;
	y: number;
	text: string;
	opacity?: number;
	anchor?: "start" | "middle" | "end";
}) {
	return (
		<text
			x={x}
			y={y}
			fontSize={7}
			fill={TEXT_MUTED}
			textAnchor={anchor}
			opacity={opacity}
			style={{ fontFamily: MONO_FONT }}
		>
			{text}
		</text>
	);
}

// ----------------------------------------------------------------------------
// 01 Hybrid Retrieval — 4 streams converge into a result pill
// ----------------------------------------------------------------------------

function HybridRetrievalVisual() {
	const target = { x: 240, y: 90 };
	const streams = [
		{ y: 36, label: "semantic", delay: 0 },
		{ y: 72, label: "keyword", delay: 0.9 },
		{ y: 108, label: "graph", delay: 1.8 },
		{ y: 144, label: "temporal", delay: 2.7 },
	];

	function bezierAt(y: number, t: number) {
		const u = 1 - t;
		const startX = 0;
		const midX = 120;
		const endX = target.x - 22;
		const endY = target.y;
		return {
			x: u * u * startX + 2 * u * t * midX + t * t * endX,
			y: u * u * y + 2 * u * t * y + t * t * endY,
		};
	}

	return (
		<>
			{/* Stream trails */}
			{streams.map((s) => (
				<path
					key={`trail-${s.label}`}
					d={`M 0 ${s.y} Q 120 ${s.y} ${target.x - 22} ${target.y}`}
					stroke="currentColor"
					strokeWidth={0.9}
					strokeOpacity={0.18}
					strokeDasharray="2 4"
					fill="none"
				/>
			))}

			{/* Stream labels */}
			{streams.map((s) => (
				<MonoLabel key={`lbl-${s.label}`} x={6} y={s.y - 4} text={s.label} />
			))}

			{/* Beads traveling along each curve */}
			{streams.map((s) => {
				const N = 10;
				const samples = Array.from({ length: N + 1 }, (_, i) =>
					bezierAt(s.y, i / N),
				);
				return (
					<motion.circle
						key={`bead-${s.label}`}
						r={3}
						fill="currentColor"
						initial={{ opacity: 0 }}
						animate={{
							cx: samples.map((p) => p.x),
							cy: samples.map((p) => p.y),
							opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0.4, 0],
							// icon-swap: blur on entry/exit
							filter: [
								`blur(${TEXT_SWAP_BLUR}px)`,
								"blur(0px)",
								"blur(0px)",
								"blur(0px)",
								"blur(0px)",
								"blur(0px)",
								"blur(0px)",
								"blur(0px)",
								"blur(0px)",
								"blur(1px)",
								`blur(${TEXT_SWAP_BLUR}px)`,
							],
						}}
						transition={{
							duration: 3.8,
							repeat: Number.POSITIVE_INFINITY,
							delay: s.delay,
							// Linear so the bead moves at constant speed along the
							// pre-sampled bezier — EASE_HOUSE on every segment was
							// causing per-keyframe deceleration (visible stutter).
							ease: "linear",
						}}
					/>
				);
			})}

			{/* Result pill with subtle pulse — outer <g> handles position,
			    inner motion.g scales around local (0,0) which is now the pill center. */}
			<g transform={`translate(${target.x} ${target.y})`}>
				<motion.g
					animate={{ scale: [1, 1.05, 1] }}
					transition={{
						duration: 2.8,
						repeat: Number.POSITIVE_INFINITY,
						ease: EASE_BOB,
					}}
				>
					<rect
						x={-30}
						y={-14}
						width={60}
						height={28}
						rx={14}
						fill="currentColor"
						fillOpacity={0.12}
					/>
					<rect
						x={-30}
						y={-14}
						width={60}
						height={28}
						rx={14}
						fill="none"
						stroke="currentColor"
						strokeWidth={1.4}
					/>
					<text
						x={0}
						y={3}
						fontSize={9}
						textAnchor="middle"
						fill={TEXT_FG}
						style={{ fontFamily: MONO_FONT }}
					>
						ranked
					</text>
				</motion.g>
			</g>
		</>
	);
}

// ----------------------------------------------------------------------------
// 02 Active Consolidation — drifting dots cluster into 3 groups
// ----------------------------------------------------------------------------

function ActiveConsolidationVisual() {
	// 3 cluster centers, evenly spaced at the same vertical line.
	const clusters = [
		{ cx: 80, cy: 95, label: "cluster_01" },
		{ cx: 160, cy: 95, label: "cluster_02" },
		{ cx: 240, cy: 95, label: "cluster_03" },
	];

	// Non-clustered state = uniform 3-row × 7-col grid of atomic facts.
	// Each dot's grid position is its "origin"; on convergence it animates
	// to a slot around its assigned cluster.
	const COLS = 7;
	const ROWS = 3;
	const GRID_X0 = 35;
	const GRID_DX = 42;
	const GRID_Y0 = 50;
	const GRID_DY = 45;
	const dots = Array.from({ length: COLS * ROWS }, (_, i) => {
		const col = i % COLS;
		const row = Math.floor(i / COLS);
		const c = i % 3; // interleaved cluster assignment → wave-like converge
		return {
			i,
			c,
			sx: GRID_X0 + col * GRID_DX,
			sy: GRID_Y0 + row * GRID_DY,
		};
	});

	return (
		<>
			{/* Cluster halos: dashed rings — visible only while dots are settled
			    in their cluster (dots reach target at 42% and leave at 62%). */}
			{clusters.map((cl, idx) => (
				<motion.circle
					key={`halo-${cl.label}`}
					cx={cl.cx}
					cy={cl.cy}
					r={26}
					fill="none"
					stroke="currentColor"
					strokeWidth={0.6}
					strokeDasharray="2 3"
					animate={{
						opacity: [0, 0, 0.45, 0.45, 0, 0],
						filter: [
							`blur(${TEXT_SWAP_BLUR}px)`,
							`blur(${TEXT_SWAP_BLUR}px)`,
							"blur(0px)",
							"blur(0px)",
							`blur(${TEXT_SWAP_BLUR}px)`,
							`blur(${TEXT_SWAP_BLUR}px)`,
						],
					}}
					transition={{
						duration: 9.5,
						repeat: Number.POSITIVE_INFINITY,
						ease: EASE_HOUSE,
						times: [0, 0.42, 0.48, 0.6, 0.66, 1],
						delay: idx * 0.05,
					}}
				/>
			))}

			{/* Cluster labels — same window as halos */}
			{clusters.map((cl) => (
				<motion.g
					key={`lbl-${cl.label}`}
					animate={{
						opacity: [0, 0, 0.7, 0.7, 0, 0],
						// text-states-swap: clear blur on entry, slide up on exit
						filter: [
							`blur(${TEXT_SWAP_BLUR}px)`,
							`blur(${TEXT_SWAP_BLUR}px)`,
							"blur(0px)",
							"blur(0px)",
							`blur(${TEXT_SWAP_BLUR}px)`,
							`blur(${TEXT_SWAP_BLUR}px)`,
						],
						y: [TEXT_SWAP_DY, TEXT_SWAP_DY, 0, 0, -TEXT_SWAP_DY, -TEXT_SWAP_DY],
					}}
					transition={{
						duration: 9.5,
						repeat: Number.POSITIVE_INFINITY,
						ease: EASE_HOUSE,
						times: [0, 0.42, 0.48, 0.6, 0.66, 1],
					}}
				>
					<MonoLabel
						x={cl.cx}
						y={cl.cy + 40}
						text={cl.label}
						anchor="middle"
						opacity={1}
					/>
				</motion.g>
			))}

			{/* Animated dots */}
			{dots.map((d) => {
				// biome-ignore lint/style/noNonNullAssertion: static cluster lookup
				const target = clusters[d.c]!;
				const offsetAngle = ((d.i * 137) % 360) * (Math.PI / 180);
				const orbitR = 12 + (d.i % 3) * 4;
				const tx = target.cx + Math.cos(offsetAngle) * orbitR;
				const ty = target.cy + Math.sin(offsetAngle) * orbitR;
				return (
					<motion.circle
						key={`dot-${d.i}`}
						r={2.4}
						fill="currentColor"
						initial={{ cx: d.sx, cy: d.sy }}
						animate={{
							cx: [d.sx, d.sx, tx, tx, d.sx, d.sx],
							cy: [d.sy, d.sy, ty, ty, d.sy, d.sy],
						}}
						transition={{
							duration: 9.5,
							repeat: Number.POSITIVE_INFINITY,
							ease: EASE_HOUSE,
							times: [0, 0.18, 0.42, 0.62, 0.85, 1],
							delay: (d.i % 6) * 0.04,
						}}
					/>
				);
			})}
		</>
	);
}

// ----------------------------------------------------------------------------
// 03 Forgetting — central node fades to outline, satellites stay solid
// ----------------------------------------------------------------------------

function ForgettingVisual() {
	const center = { x: 160, y: 90 };
	const satellites = [
		{ x: 60, y: 45 },
		{ x: 260, y: 45 },
		{ x: 60, y: 140 },
		{ x: 260, y: 140 },
	];

	return (
		<>
			{/* Connecting lines */}
			{satellites.map((s) => (
				<motion.line
					key={`line-${s.x}-${s.y}`}
					x1={s.x}
					y1={s.y}
					x2={center.x}
					y2={center.y}
					stroke="currentColor"
					strokeWidth={0.6}
					strokeDasharray="2 3"
					animate={{ strokeOpacity: [0.45, 0.45, 0.12, 0.12, 0.45] }}
					transition={{
						duration: 9,
						repeat: Number.POSITIVE_INFINITY,
						ease: EASE_HOUSE,
						times: [0, 0.3, 0.55, 0.85, 1],
					}}
				/>
			))}

			{/* Wisp particles drifting away */}
			{Array.from({ length: 5 }).map((_, i) => {
				const angle = (i / 5) * Math.PI * 2;
				const dx = Math.cos(angle) * 55;
				const dy = Math.sin(angle) * 55;
				return (
					<motion.circle
						// biome-ignore lint/suspicious/noArrayIndexKey: static fixed-length wisp set
						key={`wisp-${i}`}
						cx={center.x}
						cy={center.y}
						r={1.4}
						fill="currentColor"
						animate={{
							x: [0, 0, dx, 0, 0],
							y: [0, 0, dy, 0, 0],
							opacity: [0, 0, 0.7, 0, 0],
							// subtle blur on the drift peak — wisp feel
							filter: [
								"blur(0px)",
								"blur(0px)",
								"blur(1px)",
								"blur(1.5px)",
								"blur(0px)",
							],
						}}
						transition={{
							duration: 9,
							repeat: Number.POSITIVE_INFINITY,
							ease: EASE_HOUSE,
							times: [0, 0.45, 0.7, 0.88, 1],
							delay: i * 0.1,
						}}
					/>
				);
			})}

			{/* Satellite nodes (always solid) */}
			{satellites.map((s) => (
				<circle
					key={`sat-${s.x}-${s.y}`}
					cx={s.x}
					cy={s.y}
					r={6}
					fill="currentColor"
					fillOpacity={0.85}
				/>
			))}

			{/* Ghost outline appearing as fill fades */}
			<motion.circle
				cx={center.x}
				cy={center.y}
				r={14}
				fill="none"
				stroke="currentColor"
				strokeWidth={1.2}
				strokeDasharray="2 3"
				animate={{
					opacity: [0, 0, 0.8, 0.8, 0],
					filter: [
						`blur(${TEXT_SWAP_BLUR}px)`,
						`blur(${TEXT_SWAP_BLUR}px)`,
						"blur(0px)",
						"blur(0px)",
						`blur(${TEXT_SWAP_BLUR}px)`,
					],
				}}
				transition={{
					duration: 9,
					repeat: Number.POSITIVE_INFINITY,
					ease: EASE_HOUSE,
					times: [0, 0.35, 0.55, 0.85, 1],
				}}
			/>

			{/* Central node (fades) */}
			<motion.circle
				cx={center.x}
				cy={center.y}
				r={14}
				fill="currentColor"
				animate={{
					fillOpacity: [1, 1, 0.18, 0.18, 1],
					filter: [
						"blur(0px)",
						"blur(0px)",
						`blur(${TEXT_SWAP_BLUR}px)`,
						`blur(${TEXT_SWAP_BLUR}px)`,
						"blur(0px)",
					],
				}}
				transition={{
					duration: 9,
					repeat: Number.POSITIVE_INFINITY,
					ease: EASE_HOUSE,
					times: [0, 0.3, 0.55, 0.85, 1],
				}}
			/>

			{/* archived_at label — text-states-swap pattern */}
			<motion.g
				animate={{
					opacity: [0, 0, 0.75, 0.75, 0],
					filter: [
						`blur(${TEXT_SWAP_BLUR}px)`,
						`blur(${TEXT_SWAP_BLUR}px)`,
						"blur(0px)",
						"blur(0px)",
						`blur(${TEXT_SWAP_BLUR}px)`,
					],
					y: [TEXT_SWAP_DY, TEXT_SWAP_DY, 0, 0, -TEXT_SWAP_DY],
				}}
				transition={{
					duration: 9,
					repeat: Number.POSITIVE_INFINITY,
					ease: EASE_HOUSE,
					times: [0, 0.4, 0.55, 0.85, 1],
				}}
			>
				<MonoLabel
					x={center.x}
					y={center.y + 32}
					text="archived_at: now"
					anchor="middle"
					opacity={1}
				/>
			</motion.g>
		</>
	);
}

// ----------------------------------------------------------------------------
// 04 Temporal Inference — phrase chip + timeline + morphing range bar
// ----------------------------------------------------------------------------

function TemporalInferenceVisual() {
	const phrases = [
		{ text: "last Tuesday", x: 240, w: 25 },
		{ text: "since January", x: 35, w: 215 },
		{ text: "3 months ago", x: 175, w: 70 },
	] as const;
	const [p0, p1, p2] = phrases;
	const railY = 130;
	const railStart = 30;
	const railEnd = 290;
	const ticks = ["jan", "mar", "may", "jul", "sep", "nov", "now"];

	return (
		<>
			{/* Chip outline */}
			<rect
				x={75}
				y={26}
				width={170}
				height={28}
				rx={14}
				fill="none"
				stroke="currentColor"
				strokeWidth={1}
				strokeOpacity={0.65}
			/>

			{/* Phrase text cycling */}
			{phrases.map((p, i) => (
				<motion.text
					key={p.text}
					x={160}
					y={40}
					fontSize={10}
					textAnchor="middle"
					dominantBaseline="central"
					fill={TEXT_FG}
					style={{ fontFamily: MONO_FONT }}
					animate={{
						opacity:
							i === 0
								? [1, 0, 0, 0, 1]
								: i === 1
									? [0, 1, 1, 0, 0]
									: [0, 0, 0, 1, 0],
						// text-states-swap: blur clears on entry, returns on exit
						filter:
							i === 0
								? [
										"blur(0px)",
										`blur(${TEXT_SWAP_BLUR}px)`,
										`blur(${TEXT_SWAP_BLUR}px)`,
										`blur(${TEXT_SWAP_BLUR}px)`,
										"blur(0px)",
									]
								: i === 1
									? [
											`blur(${TEXT_SWAP_BLUR}px)`,
											"blur(0px)",
											"blur(0px)",
											`blur(${TEXT_SWAP_BLUR}px)`,
											`blur(${TEXT_SWAP_BLUR}px)`,
										]
									: [
											`blur(${TEXT_SWAP_BLUR}px)`,
											`blur(${TEXT_SWAP_BLUR}px)`,
											`blur(${TEXT_SWAP_BLUR}px)`,
											"blur(0px)",
											`blur(${TEXT_SWAP_BLUR}px)`,
										],
						// slide up on exit, enter from below
						y:
							i === 0
								? [0, -TEXT_SWAP_DY, -TEXT_SWAP_DY, TEXT_SWAP_DY, 0]
								: i === 1
									? [TEXT_SWAP_DY, 0, 0, -TEXT_SWAP_DY, TEXT_SWAP_DY]
									: [
											TEXT_SWAP_DY,
											TEXT_SWAP_DY,
											TEXT_SWAP_DY,
											0,
											-TEXT_SWAP_DY,
										],
					}}
					transition={{
						duration: 9,
						repeat: Number.POSITIVE_INFINITY,
						ease: EASE_HOUSE,
						times: [0, 0.3, 0.5, 0.75, 1],
					}}
				>
					{p.text}
				</motion.text>
			))}

			{/* Drop arrow */}
			<line
				x1={160}
				y1={57}
				x2={160}
				y2={108}
				stroke="currentColor"
				strokeOpacity={0.4}
				strokeWidth={0.8}
				strokeDasharray="1.5 2.5"
			/>
			<polyline
				points={`156,103 160,110 164,103`}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.5}
				strokeWidth={0.8}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Timeline track */}
			<line
				x1={railStart}
				y1={railY}
				x2={railEnd}
				y2={railY}
				stroke="currentColor"
				strokeWidth={1}
				strokeOpacity={0.3}
			/>

			{/* Tick marks + labels */}
			{ticks.map((tick, i) => {
				const x = railStart + (i * (railEnd - railStart)) / (ticks.length - 1);
				return (
					<g key={tick}>
						<line
							x1={x}
							y1={railY - 4}
							x2={x}
							y2={railY + 4}
							stroke="currentColor"
							strokeWidth={1}
							strokeOpacity={0.45}
						/>
						<MonoLabel x={x} y={railY + 16} text={tick} anchor="middle" />
					</g>
				);
			})}

			{/* Morphing range bar */}
			<motion.rect
				y={railY - 6}
				height={12}
				rx={3}
				fill="currentColor"
				fillOpacity={0.55}
				animate={{
					x: [p0.x, p1.x, p1.x, p2.x, p0.x],
					width: [p0.w, p1.w, p1.w, p2.w, p0.w],
				}}
				transition={{
					duration: 9,
					repeat: Number.POSITIVE_INFINITY,
					ease: EASE_HOUSE,
					times: [0, 0.3, 0.5, 0.75, 1],
				}}
			/>
		</>
	);
}

// ----------------------------------------------------------------------------
// 05 Persistence Scoring — center node strengthens as team pings arrive
// ----------------------------------------------------------------------------

function PersistenceScoringVisual() {
	const center = { x: 160, y: 100 };
	const sats = [
		{ x: 40, y: 40, label: "team_1" },
		{ x: 280, y: 40, label: "team_2" },
		{ x: 40, y: 160, label: "team_3" },
		{ x: 280, y: 160, label: "team_4" },
	];

	return (
		<>
			{/* Concentric ripple rings — wrap in static <g> at center; animate the radius
			    (not scale) so the ring always grows from the true center. */}
			<g transform={`translate(${center.x} ${center.y})`}>
				{[0, 1, 2].map((r) => (
					<motion.circle
						key={`ring-${r}`}
						cx={0}
						cy={0}
						fill="none"
						stroke="currentColor"
						strokeWidth={0.8}
						animate={{
							r: [12, 50],
							opacity: [0.6, 0],
						}}
						transition={{
							duration: 3.6,
							repeat: Number.POSITIVE_INFINITY,
							ease: EASE_HOUSE,
							delay: r * 1.2,
						}}
					/>
				))}
			</g>

			{/* Guide lines */}
			{sats.map((s) => (
				<line
					key={`g-${s.label}`}
					x1={s.x}
					y1={s.y}
					x2={center.x}
					y2={center.y}
					stroke="currentColor"
					strokeWidth={0.5}
					strokeOpacity={0.25}
					strokeDasharray="1.5 3"
				/>
			))}

			{/* Pings */}
			{sats.map((s, i) => (
				<motion.circle
					key={`ping-${s.label}`}
					r={2.5}
					fill="currentColor"
					animate={{
						cx: [s.x, center.x],
						cy: [s.y, center.y],
						opacity: [0, 1, 0],
						// icon-swap pattern: blur on fade-in/out
						filter: [
							`blur(${TEXT_SWAP_BLUR}px)`,
							"blur(0px)",
							`blur(${TEXT_SWAP_BLUR}px)`,
						],
					}}
					transition={{
						duration: 2.4,
						repeat: Number.POSITIVE_INFINITY,
						ease: EASE_HOUSE,
						delay: i * 0.6,
						times: [0, 0.85, 1],
					}}
				/>
			))}

			{/* Satellite nodes */}
			{sats.map((s) => (
				<g key={`sat-${s.label}`}>
					<circle cx={s.x} cy={s.y} r={6} fill="currentColor" />
					<MonoLabel x={s.x} y={s.y - 12} text={s.label} anchor="middle" />
				</g>
			))}

			{/* Center node strengthening over loop */}
			<motion.circle
				cx={center.x}
				cy={center.y}
				fill="currentColor"
				animate={{ r: [9, 14, 9], fillOpacity: [0.55, 1, 0.55] }}
				transition={{
					duration: 10,
					repeat: Number.POSITIVE_INFINITY,
					ease: EASE_BOB,
				}}
			/>
		</>
	);
}

// ----------------------------------------------------------------------------
// 06 Per-Query Search Controls — 4 toggleable retrieval switches
// ----------------------------------------------------------------------------

function PerQueryControlsVisual() {
	const toggles = [
		{ label: "recency", y: 32, phase: 0 },
		{ label: "graph_depth", y: 72, phase: 2.4 },
		{ label: "cross_encoder", y: 112, phase: 4.8 },
		{ label: "diversity", y: 152, phase: 7.2 },
	] as const;
	const trackX = 210;
	const trackW = 60;
	const trackH = 18;
	const thumbR = 6;
	const offCx = trackX + thumbR + 3;
	const onCx = trackX + trackW - thumbR - 3;
	const cycle = 10; // seconds per on→off cycle

	return (
		<>
			{toggles.map((t) => (
				<g key={t.label}>
					{/* Label */}
					<MonoLabel x={20} y={t.y + 2} text={t.label} />

					{/* Track outline */}
					<rect
						x={trackX}
						y={t.y - trackH / 2}
						width={trackW}
						height={trackH}
						rx={trackH / 2}
						fill="none"
						stroke="currentColor"
						strokeOpacity={0.35}
						strokeWidth={1}
					/>

					{/* Track fill — appears while "on", with text-swap blur on entry/exit */}
					<motion.rect
						x={trackX}
						y={t.y - trackH / 2}
						width={trackW}
						height={trackH}
						rx={trackH / 2}
						fill="currentColor"
						animate={{
							fillOpacity: [0, 0.55, 0.55, 0, 0],
							filter: [
								`blur(${TEXT_SWAP_BLUR}px)`,
								"blur(0px)",
								"blur(0px)",
								`blur(${TEXT_SWAP_BLUR}px)`,
								`blur(${TEXT_SWAP_BLUR}px)`,
							],
						}}
						transition={{
							duration: cycle,
							repeat: Number.POSITIVE_INFINITY,
							ease: EASE_HOUSE,
							delay: t.phase,
							times: [0, 0.18, 0.55, 0.7, 1],
						}}
					/>

					{/* Thumb sliding off → on → off — fills with bg so it stays
					    visible against the accent track when "on". */}
					<motion.circle
						cy={t.y}
						r={thumbR}
						fill="var(--background)"
						stroke="currentColor"
						strokeWidth={1}
						animate={{ cx: [offCx, onCx, onCx, offCx, offCx] }}
						transition={{
							duration: cycle,
							repeat: Number.POSITIVE_INFINITY,
							ease: EASE_HOUSE,
							delay: t.phase,
							times: [0, 0.18, 0.55, 0.7, 1],
						}}
					/>
				</g>
			))}
		</>
	);
}

// ----------------------------------------------------------------------------
// FEATURES list + card
// ----------------------------------------------------------------------------

type Feature = {
	num: string;
	title: string;
	description: string;
	Visual: ComponentType;
};

const FEATURES: Feature[] = [
	{
		num: "01",
		title: "Hybrid Retrieval",
		description: "Four parallel search signals fused into one precise answer.",
		Visual: HybridRetrievalVisual,
	},
	{
		num: "02",
		title: "Active Consolidation",
		description:
			"Atomic facts auto-cluster into higher-level inference memories. Less noise, more signal.",
		Visual: ActiveConsolidationVisual,
	},
	{
		num: "03",
		title: "Forgetting",
		description:
			"Memories are never physically deleted. Soft-delete with full audit trail and cascading edge invalidation.",
		Visual: ForgettingVisual,
	},
	{
		num: "04",
		title: "Temporal Inference",
		description:
			"Understands natural language time expressions — “last Tuesday,” “since January,” “3 months ago.”",
		Visual: TemporalInferenceVisual,
	},
	{
		num: "05",
		title: "Persistence Scoring",
		description:
			"Organizational knowledge that compounds. Frequently accessed facts persist longer through reinforcement — the more your teams use a piece of knowledge, the more it endures.",
		Visual: PersistenceScoringVisual,
	},
	{
		num: "06",
		title: "Per-Query Search Controls",
		description:
			"Tune retrieval per-request — recency bias, graph depth, cross-encoder, diversity toggles.",
		Visual: PerQueryControlsVisual,
	},
];

function FeatureCard({ feature }: { feature: Feature }) {
	const { Visual } = feature;
	return (
		<div className="group relative flex flex-col bg-background hover:bg-card/50 transition-colors duration-200">
			<div className="relative aspect-[16/9] w-full overflow-hidden text-accent">
				<span className="absolute top-4 right-4 z-[1] font-mono text-[10px] tracking-widest text-accent/80">
					{feature.num}
				</span>
				<svg
					viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
					className="size-full"
					role="img"
					aria-label={feature.title}
					preserveAspectRatio="xMidYMid meet"
				>
					<Visual />
				</svg>
			</div>

			<div className="border-t border-foreground/10 p-5 sm:p-6">
				<h3 className="text-base font-semibold text-foreground">
					{feature.title}
				</h3>
				<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
					{feature.description}
				</p>
			</div>
		</div>
	);
}

export function Features() {
	return (
		<section
			id="features"
			className="relative px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<p className="text-accent font-mono font-bold uppercase text-center mb-4">
					[ Core Features ]
				</p>
				<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 sm:mb-16 lg:mb-20 text-center">
					Designed for reliable agent context
				</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
					{FEATURES.map((feature) => (
						<FeatureCard key={feature.num} feature={feature} />
					))}
				</div>
			</div>
		</section>
	);
}
