"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface BlockTransitionProps {
	fromColor: string;
	toColor: string;
	className?: string;
	baseCols?: number;
}

const ROWS = 12;

export function BlockTransition({
	fromColor,
	toColor,
	className,
	baseCols = 40,
}: BlockTransitionProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start 85%", "end 15%"],
	});

	const [thresholds, setThresholds] = useState<number[]>([]);
	const [cols, setCols] = useState(baseCols);

	useEffect(() => {
		const handleResize = () => {
			const w = window.innerWidth;
			let calculatedCols = baseCols;
			if (w < 640) calculatedCols = Math.floor(baseCols * 0.5);
			else if (w < 1024) calculatedCols = Math.floor(baseCols * 0.75);

			setCols(calculatedCols);

			const newThresholds: number[] = [];
			for (let r = 0; r < ROWS; r++) {
				for (let c = 0; c < calculatedCols; c++) {
					const base = (ROWS - 1 - r) / (ROWS - 1);
					const noise = (Math.random() - 0.5) * 0.4;
					newThresholds.push(Math.max(0, Math.min(1, base + noise)));
				}
			}
			setThresholds(newThresholds);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [baseCols]);

	return (
		<div
			ref={containerRef}
			className={cn("w-full grid", fromColor, className)}
			style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
		>
			{thresholds.length > 0 &&
				Array.from({ length: ROWS * cols }).map((_, i) => (
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
				className={cn("absolute inset-0", toColor)}
				style={{ opacity }}
			/>
		</div>
	);
}
