"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { motion } from "motion/react";

interface AnimatedCheckboxProps {
	title?: string;
	checked?: boolean;
	className?: string;
}

const springTransition = {
	type: "spring" as const,
	duration: 0.4,
	bounce: 0.2,
};

export function AnimatedCheckbox({
	title = "Implement Checkbox",
	checked = false,
	className,
}: AnimatedCheckboxProps) {
	return (
		<div className={cn("flex items-center gap-3 select-none", className)}>
			<div
				className={cn(
					"size-4.5 rounded-[6px] flex items-center justify-center border-[1.5px] transition-colors duration-200",
					checked
						? "bg-foreground border-transparent"
						: "bg-transparent border-muted-foreground/40",
				)}
			>
				<svg
					viewBox="0 0 20 20"
					className="size-full text-background"
					aria-hidden="true"
				>
					<motion.path
						d="M 0 4.5 L 3.182 8 L 10 0"
						fill="transparent"
						stroke="currentColor"
						strokeWidth={1.5}
						strokeLinecap="round"
						strokeLinejoin="round"
						transform="translate(5 6)"
						initial={{
							pathLength: 0,
							opacity: 0,
						}}
						animate={{
							pathLength: checked ? 1 : 0,
							opacity: checked ? 1 : 0,
						}}
						transition={{
							pathLength: { ease: "easeOut", duration: 0.3 },
							opacity: { duration: 0 },
						}}
					/>
				</svg>
			</div>
			<div className="relative">
				<span
					className={cn(
						"text-base font-medium transition-colors duration-200",
						checked ? "text-muted-foreground" : "text-foreground",
					)}
				>
					{title}
				</span>
				<motion.div
					className="absolute left-0 top-1/2 h-[1.5px] bg-muted-foreground -translate-y-1/2"
					initial={{
						width: 0,
						opacity: 0,
					}}
					animate={{
						width: checked ? "100%" : 0,
						opacity: checked ? 1 : 0,
					}}
					transition={springTransition}
				/>
			</div>
		</div>
	);
}
