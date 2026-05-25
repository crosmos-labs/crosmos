import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import type { BaseEdge, BaseNode } from "../types/public";

export function computeCommunities<
	TNode extends BaseNode,
	TEdge extends BaseEdge,
>(nodes: TNode[], edges: TEdge[]): Map<string, number> {
	if (nodes.length < 2) return new Map();

	const g = new Graph({ type: "undirected", multi: false });
	for (const n of nodes) {
		if (!g.hasNode(n.id)) g.addNode(n.id);
	}
	for (const e of edges) {
		if (e.source === e.target) continue;
		if (!g.hasNode(e.source) || !g.hasNode(e.target)) continue;
		if (!g.hasEdge(e.source, e.target)) {
			g.addEdge(e.source, e.target);
		}
	}

	if (g.size === 0) return new Map();

	const assignments = louvain(g);
	const out = new Map<string, number>();
	for (const id in assignments) {
		const c = assignments[id];
		if (typeof c === "number") out.set(id, c);
	}
	return out;
}
