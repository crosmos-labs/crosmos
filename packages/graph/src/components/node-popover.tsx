"use client";

import { useEffect } from "react";
import type { GraphNode } from "../types";

function formatDate(dateStr: string | null): string | null {
	if (!dateStr) return null;
	try {
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch {
		return dateStr;
	}
}

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

	const createdDate = formatDate(node.created_at);
	const updatedDate = formatDate(node.updated_at);

	return (
		<div className="absolute top-3 right-3 z-20 w-64 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-sm font-semibold leading-snug break-words">
					{node.name}
				</h3>
			</div>

			<div className="mt-4 flex flex-col gap-2">
				{node.entity_type && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground w-14 shrink-0">
							Type
						</span>
						<span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
							{node.entity_type}
						</span>
					</div>
				)}

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground w-14 shrink-0">
						Relations
					</span>
					<span className="text-xs font-medium">{node.edge_count}</span>
				</div>

				{createdDate && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground w-14 shrink-0">
							Created
						</span>
						<span className="text-xs">{createdDate}</span>
					</div>
				)}

				{updatedDate && updatedDate !== createdDate && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground w-14 shrink-0">
							Updated
						</span>
						<span className="text-xs">{updatedDate}</span>
					</div>
				)}
			</div>
		</div>
	);
}
