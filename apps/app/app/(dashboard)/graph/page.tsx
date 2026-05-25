"use client";

import { ForceGraph } from "@crosmos/graph";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { EdgePopover } from "@/components/graph/edge-popover";
import { NodePopover } from "@/components/graph/node-popover";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useGraph } from "@/hooks/use-graph";
import { useSpaces } from "@/hooks/use-spaces";
import {
	edgeFromWire,
	type GraphEdge,
	type GraphNode,
	nodeFromWire,
} from "@/lib/graph/mappers";

export default function GraphPage() {
	const {
		data: spaces,
		isLoading: spacesLoading,
		error: spacesError,
	} = useSpaces();
	const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
	const {
		data: graphData,
		isLoading: graphLoading,
		error: graphError,
	} = useGraph(selectedSpaceId || null);

	const nodes = useMemo<GraphNode[]>(
		() => graphData?.nodes.map(nodeFromWire) ?? [],
		[graphData],
	);
	const edges = useMemo<GraphEdge[]>(
		() => graphData?.edges.map(edgeFromWire) ?? [],
		[graphData],
	);

	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
	const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

	const nodeMap = useMemo(() => {
		const map = new Map<string, GraphNode>();
		for (const n of nodes) map.set(n.id, n);
		return map;
	}, [nodes]);

	const { setBreadcrumb } = useBreadcrumb();
	const { mutate } = useSWRConfig();

	useEffect(() => {
		setBreadcrumb({ label: "Graph" });
		return () => setBreadcrumb(null);
	}, [setBreadcrumb]);

	useEffect(() => {
		if (spaces && spaces.length > 0 && !selectedSpaceId) {
			const firstSpace = spaces[0];
			if (firstSpace) setSelectedSpaceId(firstSpace.id);
		}
	}, [spaces, selectedSpaceId]);

	useEffect(() => {
		setSelectedNode(null);
		setSelectedEdge(null);
	}, []);

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

	if (spacesError) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">Graph</h1>
					<p className="text-sm text-muted-foreground">
						Knowledge graph visualization
					</p>
				</div>
				<DataFetchError
					message={spacesError.message}
					onRetry={() => mutate("/spaces")}
				/>
			</div>
		);
	}

	const isInitialLoading =
		(spacesLoading && !spaces) || (graphLoading && !graphData);

	return (
		<div className="flex h-[calc(100dvh-8rem)] flex-col gap-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">Graph</h1>
				{spaces && spaces.length > 0 && (
					<Select value={selectedSpaceId} onValueChange={setSelectedSpaceId}>
						<SelectTrigger aria-label="Select space" className="w-[240px]">
							<SelectValue placeholder="Select a space" />
						</SelectTrigger>
						<SelectContent>
							{spaces.map((space) => (
								<SelectItem key={space.id} value={space.id}>
									{space.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>

			{graphData && (
				<p className="text-sm text-muted-foreground">
					{graphData.total_nodes} nodes · {graphData.total_edges} edges
				</p>
			)}

			{graphError && selectedSpaceId && (
				<DataFetchError
					message={graphError.message}
					onRetry={() => mutate(`/graph?space_uuid=${selectedSpaceId}`)}
				/>
			)}

			{isInitialLoading && <Skeleton className="flex-1 min-h-0 w-full" />}

			{!isInitialLoading && graphData && (
				<div className="flex-1 min-h-0 rounded-md border relative">
					<ForceGraph<GraphNode, GraphEdge>
						key={selectedSpaceId}
						nodes={nodes}
						edges={edges}
						onNodeClick={handleNodeClick}
						onEdgeClick={handleEdgeClick}
						onBackgroundClick={handleBackgroundClick}
						isLoading={graphLoading}
						showZoomLevel="top-right"
					/>
					{graphLoading && (
						<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
							<Skeleton className="h-8 w-8 rounded-full" />
						</div>
					)}
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
			)}
		</div>
	);
}
