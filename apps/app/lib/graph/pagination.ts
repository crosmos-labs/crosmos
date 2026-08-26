import type { GraphViewportResponse } from "./wire";

export const GRAPH_PAGE_SIZE = 500;
export const MAX_GRAPH_NODES = 10_000;
export const MAX_GRAPH_EDGES = 50_000;

export function graphPageCount(totalNodes: number): number {
	return Math.min(
		Math.max(1, Math.ceil(totalNodes / GRAPH_PAGE_SIZE)),
		Math.ceil(MAX_GRAPH_NODES / GRAPH_PAGE_SIZE),
	);
}

export function mergeGraphPages(
	pages: readonly GraphViewportResponse[],
): GraphViewportResponse {
	const nodes = new Map<string, GraphViewportResponse["nodes"][number]>();
	const edges = new Map<string, GraphViewportResponse["edges"][number]>();

	for (const page of pages) {
		for (const node of page.nodes) {
			if (!nodes.has(node.id) && nodes.size < MAX_GRAPH_NODES) {
				nodes.set(node.id, node);
			}
		}
	}

	for (const page of pages) {
		for (const edge of page.edges) {
			if (edges.size >= MAX_GRAPH_EDGES) break;
			if (
				nodes.has(edge.source_entity_id) &&
				nodes.has(edge.target_entity_id) &&
				!edges.has(edge.id)
			) {
				edges.set(edge.id, edge);
			}
		}
		if (edges.size >= MAX_GRAPH_EDGES) break;
	}

	return {
		nodes: [...nodes.values()],
		edges: [...edges.values()],
		total_nodes: pages[0]?.total_nodes ?? 0,
		total_edges: pages[0]?.total_edges ?? 0,
	};
}
