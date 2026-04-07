"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────

interface LogoDef {
	name: string;
	src: string;
	url: string;
	width: number;
	height: number;
	colored?: boolean;
}

// ── Logo data ───────────────────────────────────────────────────────

const LOGOS: LogoDef[] = [
	{
		name: "Claude Code",
		src: "/brands/claude.svg",
		url: "/",
		width: 121,
		height: 26,
		colored: true,
	},
	{
		name: "Cursor",
		src: "/brands/cursor.svg",
		url: "/",
		width: 150,
		height: 26,
		colored: true,
	},
	{
		name: "Openai",
		src: "/brands/openai.svg",
		url: "/",
		width: 150,
		height: 40,
		colored: true,
	},
	{
		name: "Opencode",
		src: "/brands/opencode.svg",
		url: "/",
		width: 175,
		height: 24,
		colored: true,
	},
	{
		name: "Openclaw",
		src: "/brands/openclaw.svg",
		url: "/",
		width: 191,
		height: 28,
		colored: true,
	},
	{
		name: "Notion",
		src: "/brands/notion.svg",
		url: "/",
		width: 138,
		height: 30,
		colored: true,
	},
	{
		name: "Obsidian",
		src: "/brands/obsidian.svg",
		url: "/",
		width: 213,
		height: 30,
		colored: true,
	},
	{
		name: "Drive",
		src: "/brands/drive.svg",
		url: "/",
		width: 180,
		height: 30,
		colored: true,
	},
];

// ── Constants ───────────────────────────────────────────────────────

const SLOT_WIDTH = 300;
const SLOT_HEIGHT = Math.max(...LOGOS.map((l) => l.height));
const INITIAL_DELAY = 2500;
const SLOT_STAGGER = 150;
const CYCLE_INTERVAL = 3000;

const LOGO_SRCS = LOGOS.map((l) => l.src);

// ── Hooks ───────────────────────────────────────────────────────────

/** Returns fixed slot count of 4 logos per row. */
function useSlotCount(): number {
	const [count, setCount] = useState(3);
	useEffect(() => {
		const mqMd = window.matchMedia("(min-width: 768px)");
		const mqLg = window.matchMedia("(min-width: 1024px)");
		const update = () => {
			if (mqLg.matches) setCount(3);
			else if (mqMd.matches) setCount(2);
			else setCount(1);
		};
		update();
		mqMd.addEventListener("change", update);
		mqLg.addEventListener("change", update);
		return () => {
			mqMd.removeEventListener("change", update);
			mqLg.removeEventListener("change", update);
		};
	}, []);
	return count;
}

/** Resolves `true` once every image in `srcs` has loaded (or errored). */
function useImagesPreloaded(srcs: readonly string[]): boolean {
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		let cancelled = false;

		Promise.all(
			srcs.map(
				(src) =>
					new Promise<void>((resolve) => {
						const img = new window.Image();
						img.onload = () => resolve();
						img.onerror = () => resolve();
						img.src = src;
					}),
			),
		).then(() => {
			if (!cancelled) setLoaded(true);
		});

		return () => {
			cancelled = true;
		};
	}, [srcs]);

	return loaded;
}

/**
 * Cycles through a list of logos.
 * Pauses when the tab is hidden so staggered delays stay in sync on return.
 */
function useLogoCycle(
	logos: LogoDef[],
	initialDelay: number,
	enabled: boolean,
) {
	const [step, setStep] = useState(0);
	const current = logos[step % logos.length];

	useEffect(() => {
		if (!enabled) return;

		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let startedAt = 0;
		let remaining = step === 0 ? initialDelay : CYCLE_INTERVAL;

		const schedule = (delay: number) => {
			remaining = delay;
			startedAt = Date.now();
			timeoutId = setTimeout(() => setStep((s) => s + 1), delay);
		};

		const pause = () => {
			if (timeoutId != null) {
				clearTimeout(timeoutId);
				timeoutId = null;
				remaining = Math.max(0, remaining - (Date.now() - startedAt));
			}
		};

		const onVisibilityChange = () => {
			if (document.hidden) pause();
			else schedule(remaining);
		};

		document.addEventListener("visibilitychange", onVisibilityChange);
		if (!document.hidden) schedule(remaining);

		return () => {
			if (timeoutId != null) clearTimeout(timeoutId);
			document.removeEventListener("visibilitychange", onVisibilityChange);
		};
	}, [enabled, step, initialDelay]);

	return { current, hasCycled: step > 0 };
}

// ── LogoSlot ────────────────────────────────────────────────────────

type CarouselVariant = "muted" | "dark";

const variantStyles: Record<
	CarouselVariant,
	{ base: string; interactive: string }
> = {
	muted: {
		base: "brightness-0 opacity-40 dark:invert",
		interactive: "transition-opacity duration-200 hover:opacity-60",
	},
	dark: {
		base: "brightness-0 dark:invert",
		interactive: "transition-opacity duration-200 opacity-80 hover:opacity-100",
	},
};

function LogoSlot({
	logos,
	slotIndex,
	enabled,
	disableLinks,
	variant = "muted",
}: {
	logos: LogoDef[];
	slotIndex: number;
	enabled: boolean;
	disableLinks?: boolean;
	variant?: CarouselVariant;
}) {
	const reducedMotion = useReducedMotion();
	const { current: logo, hasCycled } = useLogoCycle(
		logos,
		INITIAL_DELAY + slotIndex * SLOT_STAGGER,
		enabled,
	);

	const styles = variantStyles[variant];
	const isColored = logo?.colored;
	const imgEl = (
		// TODO: change to next Image tag
		// biome-ignore lint/performance/noImgElement: Do not require optimisation
		<img
			src={logo?.src}
			alt={disableLinks ? logo?.name : ""}
			width={logo?.width}
			height={logo?.height}
			className={cn(
				!isColored && styles.base,
				!disableLinks && styles.interactive,
				isColored && "opacity-80",
			)}
		/>
	);

	return (
		<div
			className="overflow-hidden flex items-center justify-center"
			style={{
				width: SLOT_WIDTH,
				height: SLOT_HEIGHT + 40,
				marginBlock: -20,
			}}
		>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.div
					key={logo?.name}
					initial={
						!hasCycled
							? false
							: reducedMotion
								? { opacity: 0 }
								: { y: 20, opacity: 0, filter: "blur(8px)" }
					}
					animate={
						reducedMotion
							? { opacity: 1 }
							: { y: 0, opacity: 1, filter: "blur(0px)" }
					}
					exit={
						reducedMotion
							? { opacity: 0 }
							: { y: -20, opacity: 0, filter: "blur(8px)" }
					}
					transition={{ duration: 0.5, ease: "easeInOut" }}
					className="flex items-center justify-center will-change-[filter] backface-hidden"
				>
					{disableLinks ? (
						imgEl
					) : (
						<Link
							href={`${logo?.url}?ref=arc`}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`${logo?.name} (opens in new tab)`}
						>
							{imgEl}
						</Link>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

// ── LogoCarousel ────────────────────────────────────────────────────

export function LogoCarousel({
	className,
	disableLinks,
	variant = "muted",
}: {
	className?: string;
	disableLinks?: boolean;
	variant?: CarouselVariant;
}) {
	const allLoaded = useImagesPreloaded(LOGO_SRCS);
	const slotCount = useSlotCount();

	const slotLogos = useMemo(
		() =>
			Array.from({ length: slotCount }, (_, slot) =>
				LOGOS.filter((_, i) => i % slotCount === slot),
			),
		[slotCount],
	);

	return (
		<motion.div
			role="region"
			aria-roledescription="carousel"
			aria-label="Connectors, plugins and mcp we support"
			initial={{ opacity: 0 }}
			animate={{ opacity: allLoaded ? 1 : 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
			className={cn("flex items-center gap-1", className)}
		>
			{slotLogos.map((logos, i) => (
				<LogoSlot
					key={i}
					logos={logos}
					slotIndex={i}
					enabled={allLoaded}
					disableLinks={disableLinks}
					variant={variant}
				/>
			))}
		</motion.div>
	);
}
