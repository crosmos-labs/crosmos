"use client";

import { cn } from "@crosmos/ui/lib/utils";
import {
	AnimatePresence,
	motion,
	useInView,
	useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const STEP_DURATION = 5;
const EASE_HOUSE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type TLine =
	| { kind: "thought"; text: string; delay: number }
	| { kind: "action"; verb: string; detail: string; delay: number }
	| { kind: "proc"; text: string; delay: number }
	| {
			kind: "out";
			key: string;
			value: string;
			delay: number;
			highlight?: boolean;
	  }
	| {
			kind: "ranked";
			rank: string;
			entity: string;
			detail: string;
			score: string;
			delay: number;
			highlight?: boolean;
	  };

const STEPS: {
	number: string;
	title: string;
	description: string;
	prompt: string;
	status: string;
	lines: TLine[];
}[] = [
	{
		number: "01",
		title: "Ingest",
		description:
			"Send any content: conversations, documents, notes. Crosmos extracts structured facts, identifies entities, and maps relationships in a single pass.",
		prompt: '/ingest "Alice joined Acme Corp as Head of Engineering."',
		status: "crosmos · ingest",
		lines: [
			{ kind: "thought", text: "Thought for 1.3s", delay: 0.2 },
			{
				kind: "proc",
				text: "extracting entities and relationships...",
				delay: 0.55,
			},
			{ kind: "action", verb: "Ingest", detail: "conversation", delay: 0.95 },
			{ kind: "out", key: "entities", value: "3", delay: 1.25 },
			{ kind: "out", key: "edges", value: "2", delay: 1.4 },
			{ kind: "out", key: "confidence", value: "0.97", delay: 1.55 },
			{
				kind: "out",
				key: "id",
				value: "mem_8f2a4c",
				delay: 1.7,
				highlight: true,
			},
		],
	},
	{
		number: "02",
		title: "Structure",
		description:
			"Facts are embedded, entities are resolved against your existing knowledge, and typed relationships are created with confidence scores. Everything is timestamped and traceable to its source.",
		prompt: "/graph update",
		status: "crosmos · structure",
		lines: [
			{ kind: "thought", text: "Thought for 2.1s", delay: 0.2 },
			{
				kind: "action",
				verb: "Resolve",
				detail: "entities  graph",
				delay: 0.5,
			},
			{
				kind: "proc",
				text: "resolving  Alice Johnson    person",
				delay: 0.75,
			},
			{
				kind: "proc",
				text: "resolving  Acme Corp        org",
				delay: 0.95,
			},
			{
				kind: "proc",
				text: "linking    WORKS_FOR        valid_from: 2025-05-13",
				delay: 1.15,
			},
			{ kind: "out", key: "nodes", value: "1,284", delay: 1.55 },
			{ kind: "out", key: "edges", value: "3,891", delay: 1.7 },
			{
				kind: "out",
				key: "status",
				value: "updated",
				delay: 1.85,
				highlight: true,
			},
		],
	},
	{
		number: "03",
		title: "Retrieve",
		description:
			"When your agents need context, Crosmos runs multiple search signals in parallel, fuses the results, and returns precise, ranked context.",
		prompt: '/search "who leads engineering at Acme Corp?"',
		status: "crosmos · retrieve",
		lines: [
			{ kind: "thought", text: "Thought for 1.8s", delay: 0.2 },
			{ kind: "proc", text: "running hybrid retrieval...", delay: 0.5 },
			{ kind: "action", verb: "Search", detail: "graph  hybrid", delay: 0.9 },
			{
				kind: "ranked",
				rank: "1",
				entity: "Alice Johnson",
				detail: "WORKS_FOR Acme Corp",
				score: "0.97",
				delay: 1.25,
				highlight: true,
			},
			{
				kind: "ranked",
				rank: "2",
				entity: "Acme Corp",
				detail: "Engineering Team",
				score: "0.89",
				delay: 1.4,
			},
			{
				kind: "ranked",
				rank: "3",
				entity: "Project Phoenix",
				detail: "led by Alice J.",
				score: "0.84",
				delay: 1.55,
			},
		],
	},
];

const COLOR_PRIMARY = "oklch(0.92 0 0)";
const COLOR_SECONDARY = "oklch(0.70 0 0)";
const COLOR_MUTED = "oklch(0.50 0 0)";
const COLOR_PROMPT_CHEVRON = "oklch(0.74 0.11 290)";
const COLOR_HIGHLIGHT_BG = "oklch(0.30 0.08 135 / 0.32)";

function LineContent({ line }: { line: TLine }) {
	if (line.kind === "thought") {
		return (
			<>
				<span style={{ color: "var(--accent)", fontSize: "0.7em" }}>◆</span>{" "}
				<span style={{ color: COLOR_MUTED }}>{line.text}</span>
			</>
		);
	}
	if (line.kind === "action") {
		return (
			<>
				<span style={{ color: "var(--accent)", fontSize: "0.7em" }}>◆</span>{" "}
				<span style={{ color: COLOR_PRIMARY, fontWeight: 600 }}>
					{line.verb}
				</span>
				<span style={{ color: COLOR_SECONDARY }}>{`  ${line.detail}`}</span>
			</>
		);
	}
	if (line.kind === "proc") {
		return <span style={{ color: COLOR_SECONDARY }}>{`  ${line.text}`}</span>;
	}
	if (line.kind === "out") {
		return (
			<>
				<span
					style={{ color: COLOR_SECONDARY }}
				>{`  ${line.key.padEnd(14)}`}</span>
				<span style={{ color: COLOR_PRIMARY }}>{line.value}</span>
			</>
		);
	}
	return (
		<>
			<span
				style={{ color: COLOR_SECONDARY }}
			>{`  ${line.rank.padEnd(3)}`}</span>
			<span style={{ color: COLOR_PRIMARY }}>{line.entity.padEnd(20)}</span>
			<span style={{ color: COLOR_SECONDARY }}>{line.detail.padEnd(24)}</span>
			<span style={{ color: "var(--accent)" }}>{line.score}</span>
		</>
	);
}

export function HowItWorks() {
	const [activeStep, setActiveStep] = useState(0);
	const [progressKey, setProgressKey] = useState(0);
	const [started, setStarted] = useState(false);
	const reducedMotion = useReducedMotion() ?? false;

	const sectionRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

	useEffect(() => {
		if (isInView) setStarted(true);
	}, [isInView]);

	// Auto-advance: progressKey in deps is intentional, it acts as a reset trigger
	// biome-ignore lint/correctness/useExhaustiveDependencies: progressKey triggers re-run without being read
	useEffect(() => {
		if (!started) return;
		const id = setTimeout(() => {
			setActiveStep((s) => (s + 1) % 3);
			setProgressKey((k) => k + 1);
		}, STEP_DURATION * 1000);
		return () => clearTimeout(id);
	}, [started, progressKey]);

	const goToStep = (i: number) => {
		setActiveStep(i);
		setProgressKey((k) => k + 1);
	};

	// biome-ignore lint/style/noNonNullAssertion: activeStep is always 0|1|2, STEPS has 3 elements
	const step = STEPS[activeStep]!;

	return (
		<section
			id="how-it-works"
			className="relative px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto" ref={sectionRef}>
				<p className="text-primary font-mono font-bold uppercase text-center mb-4">
					[ How It Works ]
				</p>
				<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 sm:mb-14 lg:mb-16">
					From content to context. Automatically.
				</h2>

				<div className="max-w-3xl mx-auto">
					{/* Step tab selector */}
					<div className="flex mb-6" role="tablist">
						{STEPS.map((s, i) => (
							<button
								type="button"
								role="tab"
								id={`tab-${s.number}`}
								aria-selected={i === activeStep}
								aria-controls={`tabpanel-${s.number}`}
								key={s.number}
								className={cn(
									"flex-1 text-center cursor-pointer bg-transparent border-none",
									"focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-sm",
								)}
								onClick={() => goToStep(i)}
							>
								<div className="flex items-baseline justify-center gap-2 mb-3 pr-4">
									<span
										className={cn(
											"font-mono text-xs font-bold transition-colors duration-300",
											i === activeStep ? "text-primary" : "text-foreground/25",
										)}
									>
										{s.number}
									</span>
									<span
										className={cn(
											"text-sm font-medium transition-colors duration-300",
											i === activeStep
												? "text-foreground"
												: "text-foreground/30",
										)}
									>
										{s.title}
									</span>
								</div>
								<div className="relative h-[2px] bg-foreground/10">
									{i === activeStep && started && (
										<motion.div
											key={progressKey}
											className="absolute inset-0 bg-primary"
											style={{ originX: 0 }}
											initial={{ scaleX: 0 }}
											animate={{ scaleX: 1 }}
											transition={{
												duration: STEP_DURATION,
												ease: "linear",
											}}
										/>
									)}
								</div>
							</button>
						))}
					</div>

					{/* Terminal card */}
					<div
						className="rounded-xl overflow-hidden mb-8"
						style={{ backgroundColor: "oklch(0.19 0 0)" }}
					>
						{/* Header bar, traffic lights + working directory */}
						<div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06]">
							<div className="flex gap-1.5">
								<div className="size-2.5 rounded-full bg-[#ff5f57]" />
								<div className="size-2.5 rounded-full bg-[#febc2e]" />
								<div className="size-2.5 rounded-full bg-[#28c840]" />
							</div>
							<span className="text-xs font-mono pointer-events-none">
								<span style={{ color: COLOR_MUTED }}>crosmos/</span>
								<span style={{ color: COLOR_SECONDARY }}>memory</span>
							</span>
						</div>

						{/* Terminal content. Input box containers, chevrons, and caret are static across all 3 steps,
						    only the changing text/lines crossfade via per-region AnimatePresence. */}
						<div
							className="px-5 pt-4 pb-4 font-mono text-sm leading-[1.85]"
							aria-hidden="true"
						>
							{/* Top input box, container is static; only the prompt text crossfades.
							    overflow-y-hidden prevents an implicit vertical scrollbar when the prompt overflows horizontally
							    on narrow viewports (overflow-x-auto alone makes the y-axis "auto" too). */}
							<div
								className="rounded-lg px-3.5 py-2.5 mb-3 whitespace-pre overflow-x-auto overflow-y-hidden"
								style={{
									backgroundColor: "oklch(0.24 0 0)",
									boxShadow:
										"inset 0 1px 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.03)",
								}}
							>
								<span style={{ color: COLOR_PROMPT_CHEVRON }}>{"›"}</span>{" "}
								<AnimatePresence mode="wait" initial={false}>
									<motion.span
										key={activeStep}
										initial={reducedMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={reducedMotion ? {} : { opacity: 0 }}
										transition={{ duration: 0.18 }}
										style={{ color: COLOR_PROMPT_CHEVRON }}
									>
										{step.prompt}
									</motion.span>
								</AnimatePresence>
							</div>

							{/* Body lines, fixed height fits the tallest step (8 lines) to prevent layout shift across step changes.
							    overflow-y-clip (not -hidden, not overflow-x-auto): each line uses `-mx-5 px-5` to bleed
							    the highlight band past this container into the parent's padding. With overflow-x-auto,
							    the children-wider-than-container case shows a horizontal scrollbar just above the bottom
							    input, visible briefly on overlay-scrollbar platforms during state shifts. `clip` is the
							    one overflow value that does NOT trigger the CSS visible→auto coercion on the other axis,
							    so x stays visible, children bleed freely, and the terminal card's outer overflow-hidden
							    clips at the card edge. */}
							<div className="whitespace-pre overflow-y-clip h-[224px]">
								<AnimatePresence mode="wait">
									<motion.div
										key={activeStep}
										initial={reducedMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={reducedMotion ? {} : { opacity: 0 }}
										transition={{ duration: 0.18 }}
									>
										{step.lines.map((line, i) => (
											<motion.div
												// biome-ignore lint/suspicious/noArrayIndexKey: static ordered lines per step
												key={i}
												initial={reducedMotion ? false : { opacity: 0, y: 4 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{
													duration: 0.3,
													delay: reducedMotion ? 0 : line.delay,
													ease: EASE_HOUSE,
												}}
												className={cn(
													"-mx-5 px-5",
													(line.kind === "out" || line.kind === "ranked") &&
														line.highlight &&
														"highlight-row",
												)}
												style={
													(line.kind === "out" || line.kind === "ranked") &&
													line.highlight
														? { backgroundColor: COLOR_HIGHLIGHT_BG }
														: undefined
												}
											>
												<LineContent line={line} />
											</motion.div>
										))}
									</motion.div>
								</AnimatePresence>
							</div>

							{/* Bottom input box, container, chevron, and caret are static; only the right-side status crossfades. */}
							<div
								className="rounded-lg px-3.5 py-2.5 mt-3 flex items-center justify-between gap-3"
								style={{
									backgroundColor: "oklch(0.24 0 0)",
									boxShadow:
										"inset 0 1px 0 rgb(255 255 255 / 0.06), inset 0 0 0 1px rgb(255 255 255 / 0.03)",
								}}
							>
								<span className="flex items-center gap-2 min-w-0">
									<span style={{ color: COLOR_PROMPT_CHEVRON }}>{"›"}</span>
									{reducedMotion ? (
										<span
											className="inline-block w-[4px] h-[1em] align-middle"
											style={{ backgroundColor: COLOR_MUTED }}
										/>
									) : (
										<motion.span
											className="inline-block w-[4px] h-[1em] align-middle"
											style={{ backgroundColor: COLOR_MUTED }}
											animate={{ opacity: [1, 1, 0, 0] }}
											transition={{
												duration: 1,
												repeat: Number.POSITIVE_INFINITY,
												ease: "linear",
												times: [0, 0.49, 0.5, 1],
											}}
										/>
									)}
								</span>
								<AnimatePresence mode="wait" initial={false}>
									<motion.span
										key={activeStep}
										initial={reducedMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={reducedMotion ? {} : { opacity: 0 }}
										transition={{ duration: 0.18 }}
										className="text-xs whitespace-nowrap"
										style={{ color: COLOR_SECONDARY }}
									>
										{step.status}
									</motion.span>
								</AnimatePresence>
							</div>
						</div>
					</div>

					{/* Active step description */}
					<AnimatePresence mode="wait">
						<motion.div
							key={activeStep}
							role="tabpanel"
							id={`tabpanel-${step.number}`}
							aria-labelledby={`tab-${step.number}`}
							initial={reducedMotion ? false : { opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={reducedMotion ? {} : { opacity: 0, y: -4 }}
							transition={{ duration: 0.35, ease: EASE_HOUSE }}
							className="text-center max-w-2xl mx-auto min-h-[130px] sm:min-h-[140px]"
						>
							<h3 className="font-semibold text-foreground text-lg">
								{step.title}
							</h3>
							<p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
								{step.description}
							</p>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
