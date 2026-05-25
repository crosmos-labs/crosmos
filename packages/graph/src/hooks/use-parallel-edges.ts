"use client";

import { useMemo } from "react";
import type { BaseEdge } from "../types/public";

export interface ParallelEdgeMeta {
	curvature: number;
	index: number;
	count: number;
}

function pairKey(src: string, tgt: string): string {
	return src < tgt ? `${src}||${tgt}` : `${tgt}||${src}`;
}

interface PendingGroup<TEdge> {
	canonicalSource: string;
	edges: TEdge[];
}

export function useParallelEdges<TEdge extends BaseEdge>(
	edges: TEdge[],
	curvatureSpacing: number,
): Map<string, ParallelEdgeMeta> {
	return useMemo(() => {
		const groups = new Map<string, PendingGroup<TEdge>>();
		const result = new Map<string, ParallelEdgeMeta>();

		for (const e of edges) {
			if (e.source === e.target) {
				result.set(e.id, { curvature: 0, index: 0, count: 1 });
				continue;
			}
			const key = pairKey(e.source, e.target);
			let group = groups.get(key);
			if (!group) {
				group = {
					canonicalSource: e.source < e.target ? e.source : e.target,
					edges: [],
				};
				groups.set(key, group);
			}
			group.edges.push(e);
		}

		for (const { canonicalSource, edges: group } of groups.values()) {
			group.sort((a, b) => a.id.localeCompare(b.id));
			const count = group.length;
			for (let i = 0; i < count; i++) {
				const edge = group[i];
				if (!edge) continue;
				const sign = edge.source === canonicalSource ? 1 : -1;
				const curvature = sign * (i - (count - 1) / 2) * curvatureSpacing;
				result.set(edge.id, { curvature, index: i, count });
			}
		}

		return result;
	}, [edges, curvatureSpacing]);
}
