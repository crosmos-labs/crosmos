"use client";

import { ForceGraph } from "@crosmos/graph";
import { Button } from "@crosmos/ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crosmos/ui/components/select";
import { Spinner } from "@crosmos/ui/components/spinner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { EdgePopover } from "@/components/graph/edge-popover";
import { NodePopover } from "@/components/graph/node-popover";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { useGraph } from "@/hooks/use-graph";
import { spacesKey, useSpaces } from "@/hooks/use-spaces";
import {
	edgeFromWire,
	type GraphEdge,
	type GraphNode,
	nodeFromWire,
} from "@/lib/graph/mappers";
import { MAX_GRAPH_EDGES, MAX_GRAPH_NODES } from "@/lib/graph/pagination";

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
		hasMore,
		loadAll,
		isLoadingAll,
		isValidating,
		retry: retryGraph,
	} = useGraph(effectiveSpaceId || null);
	const { runAction, state } = useActionLoader();

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
	const loadedNodeCount = graphData?.nodes.length ?? 0;
	const loadedEdgeCount = graphData?.edges.length ?? 0;
	const totalNodeCount = graphData?.total_nodes ?? 0;
	const totalEdgeCount = graphData?.total_edges ?? 0;
	const limitReached =
		!hasMore &&
		((loadedNodeCount >= MAX_GRAPH_NODES && loadedNodeCount < totalNodeCount) ||
			(loadedEdgeCount >= MAX_GRAPH_EDGES && loadedEdgeCount < totalEdgeCount));
	const canLoadAll = Boolean(graphData && (hasMore || graphError));
	const loadAllBusy = state.activeCount > 0 || isLoadingAll || isValidating;
	const loadAllDisabled = loadAllBusy || !canLoadAll;

	const handleLoadAll = useCallback(() => {
		runAction(
			graphError
				? async () => {
						await retryGraph();
					}
				: loadAll,
		).catch(() => {});
	}, [graphError, loadAll, retryGraph, runAction]);

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
							{loadedNodeCount < totalNodeCount ||
							loadedEdgeCount < totalEdgeCount
								? `Showing ${loadedNodeCount} of ${totalNodeCount} nodes · ${loadedEdgeCount} of ${totalEdgeCount} edges`
								: `${totalNodeCount} nodes · ${totalEdgeCount} edges`}
						</p>
					)}
				</div>
				{spaces && spaces.length > 0 && (
					<div className="pointer-events-auto flex shrink-0 flex-col items-end gap-2">
						<Select
							value={effectiveSpaceId}
							onValueChange={handleSpaceChange}
							disabled={loadAllBusy}
						>
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
						{graphData && (
							<Button
								variant="outline"
								onClick={handleLoadAll}
								disabled={loadAllDisabled}
								aria-label={
									graphError
										? "Retry loading graph nodes"
										: limitReached
											? "Graph node limit reached"
											: "Load all graph nodes"
								}
							>
								{graphError
									? "Retry"
									: limitReached
										? "Limit reached"
										: "Load all"}
							</Button>
						)}
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
					{graphError && !graphData && effectiveSpaceId && (
						<div className="relative z-10 p-6 pt-24">
							<DataFetchError
								message={graphError.message}
								onRetry={retryGraph}
							/>
						</div>
					)}

					{isInitialLoading && (
						<div className="absolute inset-0 flex items-center justify-center">
							<Spinner className="size-6 text-muted-foreground" />
						</div>
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
									<Spinner className="size-6 text-muted-foreground" />
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
