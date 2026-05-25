import type { BaseEdge, BaseNode } from "@crosmos/graph";
import type { GraphEdgeWire, GraphNodeWire } from "./wire";

export interface GraphNode extends BaseNode {
	label: string;
	weight: number;
	data: GraphNodeWire;
}

export interface GraphEdge extends BaseEdge {
	label: string;
	data: GraphEdgeWire;
}

export function nodeFromWire(wire: GraphNodeWire): GraphNode {
	return {
		id: wire.id,
		label: wire.name,
		weight: wire.edge_count,
		data: wire,
	};
}

export function edgeFromWire(wire: GraphEdgeWire): GraphEdge {
	return {
		id: wire.id,
		source: wire.source_entity_id,
		target: wire.target_entity_id,
		label: wire.relation_type,
		data: wire,
	};
}
