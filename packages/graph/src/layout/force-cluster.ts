import type { SimulationNodeDatum } from "d3-force";

export interface ClusterForce {
	(alpha: number): void;
	initialize(nodes: SimulationNodeDatum[]): void;
}

interface CommunityCentroid {
	x: number;
	y: number;
	count: number;
}

export function createClusterForce(opts: {
	getCommunity: (nodeId: string) => number | undefined;
	strength: number;
}): ClusterForce {
	const { getCommunity, strength } = opts;
	let nodes: SimulationNodeDatum[] = [];
	const centroids = new Map<number, CommunityCentroid>();

	const force = ((alpha: number) => {
		if (nodes.length === 0) return;

		for (const c of centroids.values()) {
			c.x = 0;
			c.y = 0;
			c.count = 0;
		}

		for (const n of nodes) {
			const id = (n as { id?: unknown }).id;
			if (typeof id !== "string") continue;
			const c = getCommunity(id);
			if (c === undefined) continue;
			let entry = centroids.get(c);
			if (!entry) {
				entry = { x: 0, y: 0, count: 0 };
				centroids.set(c, entry);
			}
			entry.x += n.x ?? 0;
			entry.y += n.y ?? 0;
			entry.count += 1;
		}

		for (const c of centroids.values()) {
			if (c.count > 0) {
				c.x /= c.count;
				c.y /= c.count;
			}
		}

		const k = strength * alpha;
		for (const n of nodes) {
			const id = (n as { id?: unknown }).id;
			if (typeof id !== "string") continue;
			const c = getCommunity(id);
			if (c === undefined) continue;
			const entry = centroids.get(c);
			if (!entry || entry.count === 0) continue;
			n.vx = (n.vx ?? 0) + (entry.x - (n.x ?? 0)) * k;
			n.vy = (n.vy ?? 0) + (entry.y - (n.y ?? 0)) * k;
		}
	}) as ClusterForce;

	force.initialize = (newNodes: SimulationNodeDatum[]) => {
		nodes = newNodes;
		centroids.clear();
	};

	return force;
}
