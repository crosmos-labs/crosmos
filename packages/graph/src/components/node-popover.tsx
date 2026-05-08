"use client";

import { Badge } from "@crosmos/ui/components/badge";
import { useEffect, useMemo } from "react";
import type { GraphEdge, GraphNode } from "../types";

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
	edges: GraphEdge[];
	nodeMap: Map<string, GraphNode>;
	onClose: () => void;
}

export function NodePopover({
	node,
	edges,
	nodeMap,
	onClose,
}: NodePopoverProps) {
	const connectedEdges = useMemo(
		() =>
			edges.filter(
				(e) => e.source_entity_id === node.id || e.target_entity_id === node.id,
			),
		[edges, node.id],
	);

	const outgoingEdges = useMemo(
		() => connectedEdges.filter((e) => e.source_entity_id === node.id),
		[connectedEdges, node.id],
	);

	const incomingEdges = useMemo(
		() => connectedEdges.filter((e) => e.target_entity_id === node.id),
		[connectedEdges, node.id],
	);

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
		<div className="absolute top-3 right-3 z-20 w-72 max-h-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-sm font-semibold leading-snug break-words">
					{node.name}
				</h3>
			</div>

			<div className="mt-3 flex flex-col gap-2">
				{node.entity_type && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground w-14 shrink-0">
							Type
						</span>
						<Badge variant="secondary" className="text-xs">
							{node.entity_type}
						</Badge>
					</div>
				)}

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground w-14 shrink-0">
						Edges
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

			{outgoingEdges.length > 0 && (
				<div className="mt-3">
					<span className="text-xs font-medium text-muted-foreground">
						Outgoing
					</span>
					<div className="mt-1 flex flex-col gap-1">
						{outgoingEdges.map((e) => {
							const targetName =
								nodeMap.get(e.target_entity_id)?.name ??
								e.target_entity_id.slice(0, 8);
							return (
								<div key={e.id} className="flex items-center gap-1.5 text-xs">
									<Badge
										variant="secondary"
										className="text-[10px] px-1.5 py-0 h-4"
									>
										{e.relation_type}
									</Badge>
									<span className="truncate">{targetName}</span>
									<span className="ml-auto text-muted-foreground">
										{(e.confidence * 100).toFixed(0)}%
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{incomingEdges.length > 0 && (
				<div className="mt-3">
					<span className="text-xs font-medium text-muted-foreground">
						Incoming
					</span>
					<div className="mt-1 flex flex-col gap-1">
						{incomingEdges.map((e) => {
							const sourceName =
								nodeMap.get(e.source_entity_id)?.name ??
								e.source_entity_id.slice(0, 8);
							return (
								<div key={e.id} className="flex items-center gap-1.5 text-xs">
									<Badge
										variant="secondary"
										className="text-[10px] px-1.5 py-0 h-4"
									>
										{e.relation_type}
									</Badge>
									<span className="truncate">{sourceName}</span>
									<span className="ml-auto text-muted-foreground">
										{(e.confidence * 100).toFixed(0)}%
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
