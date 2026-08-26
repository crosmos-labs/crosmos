import type { GraphViewportResponse } from "./wire";

export const GRAPH_PAGE_SIZE = 500;
export const MAX_GRAPH_NODES = 10_000;

export function hasMoreGraphPages(
	data: GraphViewportResponse,
	lastPage: GraphViewportResponse | undefined,
): boolean {
	return (
		Boolean(lastPage?.nodes.length) &&
		data.nodes.length < data.total_nodes &&
		data.nodes.length < MAX_GRAPH_NODES
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
		for (const edge of page.edges) {
			if (!edges.has(edge.id)) edges.set(edge.id, edge);
		}
	}

	return {
		nodes: [...nodes.values()],
		edges: [...edges.values()].filter(
			(edge) =>
				nodes.has(edge.source_entity_id) && nodes.has(edge.target_entity_id),
		),
		total_nodes: pages[0]?.total_nodes ?? 0,
		total_edges: pages[0]?.total_edges ?? 0,
	};
}
