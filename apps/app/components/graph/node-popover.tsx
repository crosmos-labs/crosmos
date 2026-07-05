"use client";

import { useEffect } from "react";
import { formatDate } from "@/lib/format";
import type { GraphNode } from "@/lib/graph/mappers";

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

	const wire = node.data;
	const createdDate = wire.created_at ? formatDate(wire.created_at) : null;
	const updatedDate = wire.updated_at ? formatDate(wire.updated_at) : null;

	return (
		<div className="cg-popover">
			<div className="cg-popover-header">
				<h3 className="cg-popover-title">{wire.name}</h3>
			</div>

			<div className="cg-popover-body">
				{wire.entity_type && (
					<div className="cg-popover-row">
						<span className="cg-popover-key">Type</span>
						<span className="cg-popover-chip">{wire.entity_type}</span>
					</div>
				)}

				<div className="cg-popover-row">
					<span className="cg-popover-key">Relations</span>
					<span className="cg-popover-value">{wire.edge_count}</span>
				</div>

				{createdDate && (
					<div className="cg-popover-row">
						<span className="cg-popover-key">Created</span>
						<span className="cg-popover-value">{createdDate}</span>
					</div>
				)}

				{updatedDate && updatedDate !== createdDate && (
					<div className="cg-popover-row">
						<span className="cg-popover-key">Updated</span>
						<span className="cg-popover-value">{updatedDate}</span>
					</div>
				)}
			</div>
		</div>
	);
}
