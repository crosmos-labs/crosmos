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
import { EdgePopover } from "@/components/graph/edge-popover";
import { NodePopover } from "@/components/graph/node-popover";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { graphKey, useGraph } from "@/hooks/use-graph";
import { spacesKey, useSpaces } from "@/hooks/use-spaces";
import {
	edgeFromWire,
	type GraphEdge,
	type GraphNode,
	nodeFromWire,
} from "@/lib/graph/mappers";

type GraphSelection =
	| { type: "node"; scope: string; node: GraphNode }
	| { type: "edge"; scope: string; edge: GraphEdge }
	| null;

export default function GraphPage() {
	const orgId = useActiveOrgId();
	const {
		data: spaces,
		isLoading: spacesLoading,
		error: spacesError,
	} = useSpaces();
	const [requestedSpaceId, setRequestedSpaceId] = useState<string>("");
	const requestedSpace = spaces?.find((space) => space.id === requestedSpaceId);
	const effectiveSpaceId = requestedSpace?.id ?? spaces?.[0]?.id ?? "";
	const graphScope =
		orgId && effectiveSpaceId ? `${orgId}:${effectiveSpaceId}` : "";
	const {
		data: graphData,
		isLoading: graphLoading,
		error: graphError,
	} = useGraph(effectiveSpaceId || null);

	const nodes = useMemo<GraphNode[]>(
		() => graphData?.nodes.map(nodeFromWire) ?? [],
		[graphData],
	);
	const edges = useMemo<GraphEdge[]>(
		() => graphData?.edges.map(edgeFromWire) ?? [],
		[graphData],
	);

	const [graphSelection, setGraphSelection] = useState<GraphSelection>(null);
	const visibleSelection =
		graphSelection?.scope === graphScope ? graphSelection : null;

	const nodeMap = useMemo(() => {
		const map = new Map<string, GraphNode>();
		for (const n of nodes) map.set(n.id, n);
		return map;
	}, [nodes]);

	const { setBreadcrumb } = useBreadcrumb();
	const { mutate } = useSWRConfig();
	const spacesSwrKey = orgId ? spacesKey(orgId) : null;
	const graphSwrKey =
		orgId && effectiveSpaceId ? graphKey(orgId, effectiveSpaceId) : null;

	useEffect(() => {
		setBreadcrumb({ label: "Graph" });
		return () => setBreadcrumb(null);
	}, [setBreadcrumb]);

	const handleSpaceChange = useCallback((spaceId: string) => {
		setRequestedSpaceId(spaceId);
		setGraphSelection(null);
	}, []);

	const handleNodeClick = useCallback(
		(node: GraphNode) => {
			setGraphSelection({ type: "node", scope: graphScope, node });
		},
		[graphScope],
	);

	const handleEdgeClick = useCallback(
		(edge: GraphEdge) => {
			setGraphSelection({ type: "edge", scope: graphScope, edge });
		},
		[graphScope],
	);

	const handleBackgroundClick = useCallback(() => {
		setGraphSelection(null);
	}, []);

	const isInitialLoading =
		!orgId || (spacesLoading && !spaces) || (graphLoading && !graphData);

	return (
		<div data-graph-page className="relative h-full min-h-0 overflow-hidden">
			<div className="pointer-events-none absolute inset-x-0 top-14 z-10 flex items-start justify-between gap-4 p-6">
				<div className="w-fit min-w-0 space-y-1 rounded-lg px-3 py-2 backdrop-blur-md">
					<h1 className="text-2xl font-semibold tracking-tight">Graph</h1>
					{graphData && (
						<p className="text-sm text-muted-foreground">
							{nodes.length < graphData.total_nodes
								? `Showing ${nodes.length} of ${graphData.total_nodes} nodes`
								: `${graphData.total_nodes} nodes`}{" "}
							· {graphData.total_edges} edges
						</p>
					)}
				</div>
				{spaces && spaces.length > 0 && (
					<div className="pointer-events-auto shrink-0">
						<Select value={effectiveSpaceId} onValueChange={handleSpaceChange}>
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
					</div>
				)}
			</div>

			{spacesError ? (
				<div className="relative z-10 p-6 pt-24">
					<DataFetchError
						message={spacesError.message}
						onRetry={() =>
							spacesSwrKey ? mutate(spacesSwrKey) : Promise.resolve()
						}
					/>
				</div>
			) : (
				<>
					{graphError && effectiveSpaceId && (
						<div className="relative z-10 p-6 pt-24">
							<DataFetchError
								message={graphError.message}
								onRetry={() =>
									graphSwrKey ? mutate(graphSwrKey) : Promise.resolve()
								}
							/>
						</div>
					)}

					{isInitialLoading && (
						<Skeleton className="absolute inset-0 h-full w-full rounded-none" />
					)}

					{!isInitialLoading && graphData && (
						<div className="absolute inset-0">
							<ForceGraph<GraphNode, GraphEdge>
								key={effectiveSpaceId}
								nodes={nodes}
								edges={edges}
								onNodeClick={handleNodeClick}
								onEdgeClick={handleEdgeClick}
								onBackgroundClick={handleBackgroundClick}
								isLoading={graphLoading}
								showZoomLevel="bottom-right"
							/>
							{graphLoading && (
								<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
									<Skeleton className="h-8 w-8 rounded-full" />
								</div>
							)}
							{visibleSelection?.type === "node" && (
								<NodePopover
									node={visibleSelection.node}
									onClose={() => setGraphSelection(null)}
								/>
							)}
							{visibleSelection?.type === "edge" && (
								<EdgePopover
									edge={visibleSelection.edge}
									nodeMap={nodeMap}
									onClose={() => setGraphSelection(null)}
								/>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
