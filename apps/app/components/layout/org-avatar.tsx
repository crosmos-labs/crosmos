"use client";

import { Avatar } from "@crosmos/ui/components/avatar";
import { cn } from "@crosmos/ui/lib/utils";
import { Hashvatar } from "hashvatar/react";
import type { CSSProperties } from "react";

export function OrgAvatar({
	slug,
	size = 20,
	className,
}: {
	slug: string;
	size?: number;
	className?: string;
}) {
	// Radius scales with size (sidebar's 20px → 4px) so the rounding looks
	// identical at any size.
	const radius = Math.round(size * 0.2);
	return (
		<Avatar
			className={cn(
				"shrink-0 after:[border-radius:var(--org-avatar-radius)]",
				className,
			)}
			style={
				{
					width: size,
					height: size,
					borderRadius: radius,
					"--org-avatar-radius": `${radius}px`,
				} as CSSProperties
			}
			aria-label={`${slug} avatar`}
		>
			<Hashvatar
				hash={slug}
				size={size}
				mode="dither"
				style={{ borderRadius: radius }}
			/>
		</Avatar>
	);
}
