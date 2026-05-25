import type { BaseEdge, BaseNode } from "../types/public";

export interface GraphPage<TNode extends BaseNode, TEdge extends BaseEdge> {
	nodes: TNode[];
	edges: TEdge[];
	totalNodes?: number;
	totalEdges?: number;
	nextCursor?: string | null;
}

export interface LoadParams {
	limit?: number;
	offset?: number;
	cursor?: string | null;
	signal?: AbortSignal;
}

export interface GraphDataSource<
	TNode extends BaseNode = BaseNode,
	TEdge extends BaseEdge = BaseEdge,
> {
	/** Fetch a page of graph data. Implementations should honour `signal`. */
	load(params?: LoadParams): Promise<GraphPage<TNode, TEdge>>;

	/** Optional. Fires when upstream data may have changed; returns a teardown. */
	subscribe?(onChange: () => void): () => void;
}
