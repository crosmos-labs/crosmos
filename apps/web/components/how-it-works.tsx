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
	| { kind: "prompt"; text: string; delay: number }
	| { kind: "proc"; text: string; delay: number }
	| { kind: "out"; key: string; value: string; delay: number; prefix?: boolean }
	| {
			kind: "ranked";
			rank: string;
			entity: string;
			detail: string;
			score: string;
			delay: number;
			prefix?: boolean;
	  };

const STEPS: {
	number: string;
	title: string;
	description: string;
	lines: TLine[];
}[] = [
	{
		number: "01",
		title: "Ingest",
		description:
			"Send any content — conversations, documents, notes. Crosmos extracts structured facts, identifies entities, and maps relationships in a single pass.",
		lines: [
			{
				kind: "prompt",
				text: 'ingest("Alice joined Acme Corp as Head of Engineering.")',
				delay: 0,
			},
			{
				kind: "proc",
				text: "extracting entities and relationships...",
				delay: 0.45,
			},
			{ kind: "out", key: "entities", value: "3", delay: 1.3, prefix: true },
			{ kind: "out", key: "edges", value: "2", delay: 1.45 },
			{ kind: "out", key: "confidence", value: "0.97", delay: 1.6 },
			{ kind: "out", key: "id", value: "mem_8f2a4c", delay: 1.75 },
		],
	},
	{
		number: "02",
		title: "Structure",
		description:
			"Facts are embedded, entities are resolved against your existing knowledge, and typed relationships are created with confidence scores. Everything is timestamped and traceable to its source.",
		lines: [
			{ kind: "prompt", text: "graph.update()", delay: 0 },
			{
				kind: "proc",
				text: "resolving  Alice Johnson    person",
				delay: 0.45,
			},
			{
				kind: "proc",
				text: "resolving  Acme Corp        org",
				delay: 0.65,
			},
			{
				kind: "proc",
				text: "linking    WORKS_FOR        valid_from: 2025-05-13",
				delay: 0.85,
			},
			{ kind: "out", key: "nodes", value: "1,284", delay: 1.5, prefix: true },
			{ kind: "out", key: "edges", value: "3,891", delay: 1.65 },
			{ kind: "out", key: "status", value: "updated", delay: 1.8 },
		],
	},
	{
		number: "03",
		title: "Retrieve",
		description:
			"When your agents need context, Crosmos runs multiple search signals in parallel, fuses the results, and returns precise, ranked context.",
		lines: [
			{
				kind: "prompt",
				text: 'search("who leads engineering at Acme Corp?")',
				delay: 0,
			},
			{ kind: "proc", text: "running hybrid retrieval...", delay: 0.45 },
			{
				kind: "ranked",
				rank: "1",
				entity: "Alice Johnson",
				detail: "WORKS_FOR Acme Corp",
				score: "0.97",
				delay: 1.3,
				prefix: true,
			},
			{
				kind: "ranked",
				rank: "2",
				entity: "Acme Corp",
				detail: "Engineering Team",
				score: "0.89",
				delay: 1.45,
			},
			{
				kind: "ranked",
				rank: "3",
				entity: "Project Phoenix",
				detail: "led by Alice J.",
				score: "0.84",
				delay: 1.6,
			},
		],
	},
];

function LineContent({ line }: { line: TLine }) {
	if (line.kind === "prompt") {
		return (
			<>
				<span style={{ color: "var(--accent)" }}>{">"}</span>{" "}
				<span style={{ color: "oklch(0.88 0 0)" }}>{line.text}</span>
			</>
		);
	}
	if (line.kind === "proc") {
		return <span style={{ color: "oklch(0.38 0 0)" }}>{line.text}</span>;
	}
	if (line.kind === "out") {
		return (
			<>
				<span style={{ color: "var(--accent)" }}>
					{line.prefix ? "<" : " "}
				</span>{" "}
				<span style={{ color: "oklch(0.42 0 0)" }}>{line.key.padEnd(14)}</span>
				<span style={{ color: "oklch(0.88 0 0)" }}>{line.value}</span>
			</>
		);
	}
	return (
		<>
			<span style={{ color: "var(--accent)" }}>{line.prefix ? "<" : " "}</span>{" "}
			<span style={{ color: "oklch(0.42 0 0)" }}>{line.rank.padEnd(3)}</span>
			<span style={{ color: "oklch(0.88 0 0)" }}>{line.entity.padEnd(18)}</span>
			<span style={{ color: "oklch(0.42 0 0)" }}>{line.detail.padEnd(22)}</span>
			<span style={{ color: "var(--accent)" }}>{line.score}</span>
		</>
	);
}

export function HowItWorks() {
	const [activeStep, setActiveStep] = useState(0);
	const [progressKey, setProgressKey] = useState(0);
	const [started, setStarted] = useState(false);
	const [terminalHovered, setTerminalHovered] = useState(false);
	const reducedMotion = useReducedMotion() ?? false;

	const sectionRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

	useEffect(() => {
		if (isInView) setStarted(true);
	}, [isInView]);

	// Auto-advance: progressKey in deps is intentional — it acts as a reset trigger
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
				<p className="text-accent font-mono font-bold uppercase text-center mb-4">
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
									"focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-sm",
								)}
								onClick={() => goToStep(i)}
							>
								<div className="flex items-baseline justify-center gap-2 mb-3 pr-4">
									<span
										className={cn(
											"font-mono text-xs font-bold transition-colors duration-300",
											i === activeStep ? "text-accent" : "text-foreground/25",
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
											className="absolute inset-0 bg-accent"
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

					{/* Terminal card — mouse events are cosmetic (dot color change only) */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: hover-only visual effect, no keyboard interaction needed */}
					<div
						className="rounded-xl overflow-hidden bg-[oklch(0.18_0_0)] mb-8"
						onMouseEnter={() => setTerminalHovered(true)}
						onMouseLeave={() => setTerminalHovered(false)}
					>
						{/* macOS title bar */}
						<div className="relative flex items-center px-4 py-2.5 border-b border-white/[0.06]">
							<div className="flex gap-1.5">
								<div
									className={cn(
										"size-2.5 rounded-full transition-colors duration-200",
										terminalHovered ? "bg-[#ff5f57]" : "bg-zinc-600",
									)}
								/>
								<div
									className={cn(
										"size-2.5 rounded-full transition-colors duration-200",
										terminalHovered ? "bg-[#febc2e]" : "bg-zinc-600",
									)}
								/>
								<div
									className={cn(
										"size-2.5 rounded-full transition-colors duration-200",
										terminalHovered ? "bg-[#28c840]" : "bg-zinc-600",
									)}
								/>
							</div>
							<span className="absolute left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-mono text-[oklch(0.35_0_0)]">
								crosmos memory
							</span>
						</div>

						{/* Terminal content — AnimatePresence crossfades on step change */}
						<AnimatePresence mode="wait">
							<motion.div
								key={activeStep}
								initial={reducedMotion ? false : { opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={reducedMotion ? {} : { opacity: 0 }}
								transition={{ duration: 0.18 }}
								className="p-5 min-h-[224px] font-mono text-sm leading-[1.85] whitespace-pre overflow-x-auto"
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
									>
										<LineContent line={line} />
									</motion.div>
								))}
							</motion.div>
						</AnimatePresence>
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
							className="text-center max-w-2xl mx-auto"
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
