"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { Hashvatar } from "hashvatar/react";

// Hashvatar sets borderRadius: "50%" as an inline style by default.
// The style prop is spread last in the component, so this overrides it.
export function OrgAvatar({
	slug,
	size = 20,
	className,
}: {
	slug: string;
	size?: number;
	className?: string;
}) {
	return (
		<div
			className={cn("shrink-0", className)}
			style={{ width: size, height: size }}
			role="img"
			aria-label={`${slug} avatar`}
		>
			<Hashvatar
				hash={slug}
				size={size}
				mode="dither"
				style={{ borderRadius: "4px" }}
			/>
		</div>
	);
}
