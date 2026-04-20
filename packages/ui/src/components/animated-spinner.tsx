"use client";

import { Spinner as CliSpinner, type SpinnerName } from "@agilek/cli-loaders";

const DEFAULT_SPEED = 1.5;

interface AnimatedSpinnerProps {
	name?: SpinnerName;
	size?: string | number;
	speed?: number;
	color?: string;
	className?: string;
}

function AnimatedSpinner({
	name = "pulse",
	size = "1.1em",
	speed = DEFAULT_SPEED,
	color = "var(--accent)",
	className,
}: AnimatedSpinnerProps) {
	return (
		<CliSpinner
			name={name}
			speed={speed}
			size={size}
			color={color}
			className={className}
		/>
	);
}

export { AnimatedSpinner, type AnimatedSpinnerProps };
