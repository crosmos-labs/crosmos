"use client";

import { useEffect } from "react";
import type { GraphEdge, GraphNode } from "../types";

function formatDateTime(dateStr: string | null): string | null {
	if (!dateStr) return null;
	try {
		return new Date(dateStr).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	} catch {
		return dateStr;
	}
}

interface EdgePopoverProps {
	edge: GraphEdge;
	nodeMap: Map<string, GraphNode>;
	onClose: () => void;
}

export function EdgePopover({ edge, nodeMap, onClose }: EdgePopoverProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	const sourceNode = nodeMap.get(edge.source_entity_id);
	const targetNode = nodeMap.get(edge.target_entity_id);
	const validFromDisplay = edge.valid_from
		? formatDateTime(edge.valid_from)
		: "Ongoing";
	const recordedDisplay = formatDateTime(edge.recorded_at);

	return (
		<div className="absolute top-3 right-3 z-20 w-64 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-sm font-semibold leading-snug break-words">
					{edge.relation_type}
				</h3>
			</div>

			<div className="mt-4 flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground w-14 shrink-0">
						Source
					</span>
					<span className="text-xs font-medium">
						{sourceNode?.name ?? edge.source_entity_id}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground w-14 shrink-0">
						Target
					</span>
					<span className="text-xs font-medium">
						{targetNode?.name ?? edge.target_entity_id}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground w-14 shrink-0">
						Relation
					</span>
					<span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
						{edge.relation_type}
					</span>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground w-14 shrink-0">
						Valid from
					</span>
					<span className="text-xs">{validFromDisplay}</span>
				</div>

				{recordedDisplay && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground w-14 shrink-0">
							Recorded
						</span>
						<span className="text-xs">{recordedDisplay}</span>
					</div>
				)}
			</div>
		</div>
	);
}
