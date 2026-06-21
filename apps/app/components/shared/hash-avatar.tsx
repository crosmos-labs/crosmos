"use client";

import { Avatar } from "@crosmos/ui/components/avatar";
import { cn } from "@crosmos/ui/lib/utils";
import { Hashvatar } from "hashvatar/react";
import type { CSSProperties } from "react";

export function HashAvatar({
	hash,
	size = 20,
	label,
	className,
}: {
	hash: string;
	size?: number;
	label: string;
	className?: string;
}) {
	// Radius scales with size so the rounding looks identical at any size.
	const radius = Math.round(size * 0.2);
	return (
		<Avatar
			className={cn(
				"shrink-0 after:[border-radius:var(--hash-avatar-radius)]",
				className,
			)}
			style={
				{
					width: size,
					height: size,
					borderRadius: radius,
					"--hash-avatar-radius": `${radius}px`,
				} as CSSProperties
			}
			aria-label={label}
		>
			<Hashvatar
				hash={hash}
				size={size}
				mode="dither"
				style={{ borderRadius: radius }}
			/>
		</Avatar>
	);
}
