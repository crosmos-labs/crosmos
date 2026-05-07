"use client";

import { Badge } from "@crosmos/ui/components/badge";
import { useEffect } from "react";
import type { GraphNode } from "../types";

interface NodePopoverProps {
	node: GraphNode;
	onClose: () => void;
}

export function NodePopover({ node, onClose }: NodePopoverProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	return (
		<div className="absolute top-3 right-3 z-20 w-64 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-sm font-semibold leading-snug break-words">
					{node.name}
				</h3>
			</div>

			<div className="mt-3 flex flex-col gap-2">
				{node.entity_type && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">Type</span>
						<Badge variant="secondary" className="text-xs">
							{node.entity_type}
						</Badge>
					</div>
				)}

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">Edges</span>
					<span className="text-xs font-medium">{node.edge_count}</span>
				</div>
			</div>
		</div>
	);
}
