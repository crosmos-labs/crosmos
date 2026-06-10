import { cn } from "@crosmos/ui/lib/utils";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

const MAX_PIPS = 50;

export function SpacesMeter({ used, limit }: { used: number; limit: number }) {
	const cap = Math.min(Math.max(limit, used), MAX_PIPS);
	const overflow = limit - cap;

	return (
		<div className="flex flex-col gap-3 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Spaces</span>
				<span className="text-sm text-muted-foreground">
					<span className="font-medium text-foreground">
						{used}/{limit}
					</span>{" "}
					used
				</span>
			</div>
			<div className="flex flex-wrap items-center gap-1.5">
				{Array.from({ length: cap }, (_, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed-order static pip grid
						key={i}
						className={cn(
							"size-3 rounded-full",
							i < used ? "bg-primary" : "bg-muted",
						)}
					/>
				))}
				{overflow > 0 && (
					<span className="text-xs text-muted-foreground">+{overflow}</span>
				)}
			</div>
			<Link
				href="/spaces"
				className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
			>
				Manage spaces
				<IconArrowRight className="size-3.5" />
			</Link>
		</div>
	);
}
