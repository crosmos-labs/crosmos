"use client";

import { ForceGraph } from "@crosmos/graph";
import { MOCK_EDGES, MOCK_NODES } from "@crosmos/graph/mock";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EdgePopover } from "@/components/graph/edge-popover";
import { NodePopover } from "@/components/graph/node-popover";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import {
	edgeFromWire,
	type GraphEdge,
	type GraphNode,
	nodeFromWire,
} from "@/lib/graph/mappers";

export function DevGraph() {
	const nodes = useMemo<GraphNode[]>(() => MOCK_NODES.map(nodeFromWire), []);
	const edges = useMemo<GraphEdge[]>(() => MOCK_EDGES.map(edgeFromWire), []);

	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
	const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

	const nodeMap = useMemo(() => {
		const map = new Map<string, GraphNode>();
		for (const n of nodes) map.set(n.id, n);
		return map;
	}, [nodes]);

	const { setBreadcrumb } = useBreadcrumb();

	useEffect(() => {
		setBreadcrumb({ label: "[DEV] Graph" });
		return () => setBreadcrumb(null);
	}, [setBreadcrumb]);

	const handleNodeClick = useCallback((node: GraphNode) => {
		setSelectedNode(node);
		setSelectedEdge(null);
	}, []);

	const handleEdgeClick = useCallback((edge: GraphEdge) => {
		setSelectedEdge(edge);
		setSelectedNode(null);
	}, []);

	const handleBackgroundClick = useCallback(() => {
		setSelectedNode(null);
		setSelectedEdge(null);
	}, []);

	return (
		<div className="flex h-[calc(100dvh-8rem)] flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">Graph</h1>
			</div>

			<p className="text-sm text-muted-foreground">
				{nodes.length} nodes · {edges.length} edges
			</p>

			<div className="flex-1 min-h-0 rounded-md border relative">
				<ForceGraph<GraphNode, GraphEdge>
					nodes={nodes}
					edges={edges}
					onNodeClick={handleNodeClick}
					onEdgeClick={handleEdgeClick}
					onBackgroundClick={handleBackgroundClick}
					showZoomLevel="top-right"
				/>
				{selectedNode && (
					<NodePopover
						node={selectedNode}
						onClose={() => setSelectedNode(null)}
					/>
				)}
				{selectedEdge && (
					<EdgePopover
						edge={selectedEdge}
						nodeMap={nodeMap}
						onClose={() => setSelectedEdge(null)}
					/>
				)}
			</div>
		</div>
	);
}
