export interface RFGNode {
	id: string;
	label: string;
	weight: number;
	x?: number;
	y?: number;
	[key: string]: unknown;
}

export interface RFGLink {
	source: string | RFGNode;
	target: string | RFGNode;
	edgeId: string;
	label: string;
	curvature: number;
	parallelIndex: number;
	parallelCount: number;
	[key: string]: unknown;
}

export interface PaintHoverState {
	hoveredNodeId: string | null;
	lastHoveredNodeId: string | null;
	hoveredEdgeId: string | null;
	connectedEdges: Set<string>;
	connectedNodeIds: Set<string>;
	prevConnectedEdges: Set<string>;
	prevConnectedNodeIds: Set<string>;
	getNodeProgress: () => number;
	getEdgeProgress: () => number;
}
