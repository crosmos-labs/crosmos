"use client";

import type { GraphNode } from "@crosmos/graph";
import { ForceGraph, NodePopover } from "@crosmos/graph";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { useCallback, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useGraph } from "@/hooks/use-graph";
import { useSpaces } from "@/hooks/use-spaces";

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
	const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
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

	const handleNodeClick = useCallback((node: GraphNode) => {
		setSelectedNode(node);
	}, []);

	const handleBackgroundClick = useCallback(() => {
		setSelectedNode(null);
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
					<ForceGraph
						nodes={graphData.nodes}
						edges={graphData.edges}
						onNodeClick={handleNodeClick}
						onBackgroundClick={handleBackgroundClick}
					/>
					{selectedNode && (
						<NodePopover
							node={selectedNode}
							onClose={() => setSelectedNode(null)}
						/>
					)}
				</div>
			)}

			{!isInitialLoading &&
				graphData &&
				graphData.nodes.length === 0 &&
				selectedSpaceId && (
					<div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
						No entities in this space yet. Add sources to populate the graph.
					</div>
				)}
		</div>
	);
}
