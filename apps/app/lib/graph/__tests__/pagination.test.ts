import { expect, test } from "bun:test";
import {
	GRAPH_PAGE_SIZE,
	hasMoreGraphPages,
	MAX_GRAPH_NODES,
	mergeGraphPages,
} from "../pagination";

const node = (id: string) => ({
	id,
	name: id,
	entity_type: null,
	edge_count: 1,
	created_at: null,
	updated_at: null,
});

const edge = (id: string, source: string, target: string) => ({
	id,
	source_entity_id: source,
	target_entity_id: target,
	relation_type: "related_to",
	confidence: 1,
	valid_from: null,
	recorded_at: "2026-01-01T00:00:00Z",
});

test("merges graph pages by node and edge ID", () => {
	const merged = mergeGraphPages([
		{
			nodes: [node("a"), node("b")],
			edges: [edge("ab", "a", "b")],
			total_nodes: 3,
			total_edges: 2,
		},
		{
			nodes: [node("b"), node("c")],
			edges: [edge("ab", "a", "b"), edge("bc", "b", "c")],
			total_nodes: 3,
			total_edges: 2,
		},
	]);

	expect(merged.nodes.map(({ id }) => id)).toEqual(["a", "b", "c"]);
	expect(merged.edges.map(({ id }) => id)).toEqual(["ab", "bc"]);
	expect(merged.total_nodes).toBe(3);
	expect(merged.total_edges).toBe(2);
});

test("filters edges without loaded endpoints", () => {
	const merged = mergeGraphPages([
		{
			nodes: [node("a")],
			edges: [edge("ab", "a", "b")],
			total_nodes: 2,
			total_edges: 1,
		},
	]);

	expect(merged.edges).toEqual([]);
});

test("caps merged nodes at the client ceiling", () => {
	const merged = mergeGraphPages([
		{
			nodes: Array.from({ length: MAX_GRAPH_NODES + 1 }, (_, i) =>
				node(String(i)),
			),
			edges: [],
			total_nodes: MAX_GRAPH_NODES + 1,
			total_edges: 0,
		},
	]);

	expect(merged.nodes).toHaveLength(MAX_GRAPH_NODES);
	expect(hasMoreGraphPages(merged, merged)).toBe(false);
});

test("continues while the last page has nodes and totals remain", () => {
	const pages = [
		{
			nodes: [node("a")],
			edges: [],
			total_nodes: 2,
			total_edges: 0,
		},
		{
			nodes: [node("b")],
			edges: [],
			total_nodes: 2,
			total_edges: 0,
		},
	];

	expect(hasMoreGraphPages(mergeGraphPages(pages.slice(0, 1)), pages[0])).toBe(
		true,
	);
	expect(hasMoreGraphPages(mergeGraphPages(pages), pages[1])).toBe(false);
});

test("uses the production page size", () => {
	expect(GRAPH_PAGE_SIZE).toBe(500);
});
