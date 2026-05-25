"use client";

import { useEffect } from "react";
import type { CrosmosEdge, CrosmosNode } from "./index";

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
	edge: CrosmosEdge;
	nodeMap: Map<string, CrosmosNode>;
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

	const wire = edge.data;
	const sourceNode = nodeMap.get(edge.source);
	const targetNode = nodeMap.get(edge.target);
	const validFromDisplay = wire.valid_from
		? formatDateTime(wire.valid_from)
		: "Ongoing";
	const recordedDisplay = formatDateTime(wire.recorded_at);

	return (
		<div className="cg-popover">
			<div className="cg-popover-header">
				<h3 className="cg-popover-title">{wire.relation_type}</h3>
			</div>

			<div className="cg-popover-body">
				<div className="cg-popover-row">
					<span className="cg-popover-key">Source</span>
					<span className="cg-popover-value">
						{sourceNode?.label ?? edge.source}
					</span>
				</div>

				<div className="cg-popover-row">
					<span className="cg-popover-key">Target</span>
					<span className="cg-popover-value">
						{targetNode?.label ?? edge.target}
					</span>
				</div>

				<div className="cg-popover-row">
					<span className="cg-popover-key">Relation</span>
					<span className="cg-popover-chip">{wire.relation_type}</span>
				</div>

				<div className="cg-popover-row">
					<span className="cg-popover-key">Valid from</span>
					<span className="cg-popover-value">{validFromDisplay}</span>
				</div>

				{recordedDisplay && (
					<div className="cg-popover-row">
						<span className="cg-popover-key">Recorded</span>
						<span className="cg-popover-value">{recordedDisplay}</span>
					</div>
				)}
			</div>
		</div>
	);
}
