"use client";

import { Card } from "@crosmos/ui/components/card";
import {
	CELL,
	paintColumn,
} from "@crosmos/ui/components/dither-kit/dither-paint";
import { seedOfColor } from "@crosmos/ui/components/dither-kit/palette";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function SpacesMeterSkeleton() {
	return (
		<Card className="gap-3 p-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-20" />
			</div>
			<Skeleton className="h-3 w-full rounded-[4px]" />
			<Skeleton className="h-3 w-24" />
		</Card>
	);
}

// Filled block: the kit's fade-up dither wash (dense base, soft top edge).
function DitherFill() {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const seed = seedOfColor("green");
		const observer = new ResizeObserver(([entry]) => {
			if (!entry) return;
			const { width, height } = entry.contentRect;
			canvas.width = Math.max(2, Math.round(width / CELL));
			canvas.height = Math.max(2, Math.round(height / CELL));
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			for (let x = 0; x < canvas.width; x++) {
				paintColumn(ctx, x, 0, canvas.height, seed, {
					variant: "gradient",
					intensity: 0,
					dim: 1,
					stacked: false,
				});
			}
		});
		observer.observe(canvas);
		return () => observer.disconnect();
	}, []);

	return (
		<canvas
			ref={ref}
			aria-hidden
			className="absolute inset-0 size-full [image-rendering:pixelated]"
		/>
	);
}

export function SpacesMeter({ used, limit }: { used: number; limit: number }) {
	const unlimited = limit === -1;
	const filled = unlimited ? 0 : Math.min(used, limit);

	return (
		<Card className="gap-3 p-4">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Spaces</span>
				<span className="text-sm text-muted-foreground">
					<span className="font-medium text-foreground">
						{unlimited ? used : `${used}/${limit}`}
					</span>{" "}
					used
				</span>
			</div>
			{!unlimited && (
				<div className="flex gap-[3px]">
					{Array.from({ length: limit }, (_, i) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: fixed-order slots
							key={i}
							className={cn(
								"relative h-3 flex-1 overflow-hidden rounded-[4px]",
								i >= filled && "bg-muted",
							)}
						>
							{i < filled && <DitherFill />}
						</span>
					))}
				</div>
			)}
			<Link
				href="/spaces"
				className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				Manage spaces
				<IconArrowRight className="size-3.5" />
			</Link>
		</Card>
	);
}
