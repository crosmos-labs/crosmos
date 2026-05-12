export interface GraphNode {
	id: string;
	name: string;
	entity_type: string | null;
	edge_count: number;
	created_at: string | null;
	updated_at: string | null;
}

export interface GraphEdge {
	id: string;
	source_entity_id: string;
	target_entity_id: string;
	relation_type: string;
	valid_from: string | null;
	recorded_at: string;
}

export interface GraphViewportResponse {
	nodes: GraphNode[];
	edges: GraphEdge[];
	total_nodes: number;
	total_edges: number;
}

export interface GraphStatsResponse {
	total_entities: number;
	total_edges: number;
	entity_types: Record<string, number>;
	top_relations: Array<{ relation: string; count: number }>;
}
