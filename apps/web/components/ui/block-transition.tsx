"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const MAX_UINT32 = 4_294_967_295;

function seededNoise(seed: number, row: number, col: number, cols: number) {
	let hash = Math.floor(seed * MAX_UINT32);
	hash = Math.imul(hash ^ Math.imul(73856093, col), 1597334677);
	hash = Math.imul(hash ^ Math.imul(19349663, row), 3812015801);
	hash = Math.imul(hash ^ Math.imul(83492791, cols), 1103515245);
	hash ^= hash >>> 16;
	return (hash >>> 0) / MAX_UINT32;
}

interface BlockTransitionProps {
	fromColor: string;
	toColor: string;
	className?: string;
	baseCols?: number;
	rows?: number;
}

export function BlockTransition({
	fromColor,
	toColor,
	className,
	baseCols = 40,
	rows = 12,
}: BlockTransitionProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start 100%", "end 15%"],
	});

	const [thresholds, setThresholds] = useState<number[]>([]);
	const [cols, setCols] = useState(baseCols);
	const seedRef = useRef<number>(Math.random());
	const previousRowsRef = useRef(rows);

	useEffect(() => {
		if (previousRowsRef.current !== rows) {
			seedRef.current = Math.random();
			previousRowsRef.current = rows;
		}

		const handleResize = () => {
			const w = window.innerWidth;
			let calculatedCols = baseCols;
			if (w < 640) calculatedCols = Math.floor(baseCols * 0.5);
			else if (w < 1024) calculatedCols = Math.floor(baseCols * 0.75);

			setCols(calculatedCols);

			const newThresholds: number[] = [];
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < calculatedCols; c++) {
					const base = (rows - 1 - r) / Math.max(rows - 1, 1);
					const noise =
						(seededNoise(seedRef.current, r, c, calculatedCols) - 0.5) * 0.4;
					newThresholds.push(Math.max(0, Math.min(1, base + noise)));
				}
			}
			setThresholds(newThresholds);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [baseCols, rows]);

	return (
		<div
			ref={containerRef}
			className={cn("w-full grid gap-0", fromColor, className)}
			style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
		>
			{thresholds.length > 0 &&
				Array.from({ length: rows * cols }).map((_, i) => (
					<Block
						// biome-ignore lint/suspicious/noArrayIndexKey: positional grid items
						key={i}
						progress={scrollYProgress}
						threshold={thresholds[i] ?? 0}
						toColor={toColor}
					/>
				))}
		</div>
	);
}

function Block({
	progress,
	threshold,
	toColor,
}: {
	progress: ReturnType<typeof useScroll>["scrollYProgress"];
	threshold: number;
	toColor: string;
}) {
	const opacity = useTransform(progress, (v: number) =>
		v >= threshold ? 1 : 0,
	);

	return (
		<div className="w-full aspect-square relative">
			<motion.div
				className={cn("absolute -inset-[0.5px]", toColor)}
				style={{ opacity }}
			/>
		</div>
	);
}
