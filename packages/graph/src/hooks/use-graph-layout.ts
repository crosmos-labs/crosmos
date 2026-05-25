"use client";

import {
	forceCollide,
	forceLink,
	forceManyBody,
	forceX,
	forceY,
	type SimulationNodeDatum,
} from "d3-force";
import type { MutableRefObject } from "react";
import { useEffect } from "react";
import { createClusterForce } from "../layout/force-cluster";
import type { GraphTheme } from "../types/public";

interface ForceGraphApiLike {
	d3Force: (name: string, forceFn: unknown) => unknown;
	d3ReheatSimulation: () => unknown;
}

interface LayoutNode extends SimulationNodeDatum {
	id: string;
	weight: number;
}

interface LayoutLinkEndpoint {
	id?: string;
}

interface LayoutLink {
	source: string | LayoutLinkEndpoint;
	target: string | LayoutLinkEndpoint;
}

function endpointId(endpoint: string | LayoutLinkEndpoint): string | undefined {
	if (typeof endpoint === "string") return endpoint;
	return endpoint.id;
}

export function useGraphLayout(
	apiRef: MutableRefObject<ForceGraphApiLike | null>,
	enabled: boolean,
	dynamicLinkDistance: number,
	theme: GraphTheme,
	communities: Map<string, number>,
): void {
	const intraDistance = theme.cluster.intraLinkDistance;
	const interDistance = theme.cluster.interLinkDistance;
	const clusterStrength = theme.cluster.strength;
	const clustering = communities.size > 0;

	useEffect(() => {
		if (!enabled) return;
		const api = apiRef.current;
		if (!api) return;

		const collisionRadiusBase = theme.node.radius * 2.5;

		const linkDistance = clustering
			? (link: LayoutLink) => {
					const src = endpointId(link.source);
					const tgt = endpointId(link.target);
					if (!src || !tgt) return dynamicLinkDistance;
					const cs = communities.get(src);
					const ct = communities.get(tgt);
					if (cs === undefined || ct === undefined) return dynamicLinkDistance;
					return cs === ct ? intraDistance : interDistance;
				}
			: () => dynamicLinkDistance;

		api.d3Force(
			"link",
			forceLink()
				.id(((d: unknown) => (d as LayoutNode).id) as never)
				.distance(linkDistance as never),
		);
		api.d3Force(
			"charge",
			forceManyBody()
				.strength(theme.force.chargeStrength)
				.distanceMax(theme.force.chargeDistanceMax),
		);
		api.d3Force(
			"collide",
			forceCollide<LayoutNode>()
				.radius((node) => {
					const degreeBoost = Math.min(1.75, 1 + (node.weight ?? 0) * 0.05);
					return collisionRadiusBase * degreeBoost;
				})
				.strength(0.7)
				.iterations(4),
		);
		api.d3Force("x", forceX().strength(theme.force.boundaryStrength));
		api.d3Force("y", forceY().strength(theme.force.boundaryStrength));

		if (clustering) {
			api.d3Force(
				"cluster",
				createClusterForce({
					getCommunity: (id) => communities.get(id),
					strength: clusterStrength,
				}),
			);
		} else {
			api.d3Force("cluster", null);
		}

		api.d3ReheatSimulation();
	}, [
		apiRef,
		enabled,
		dynamicLinkDistance,
		theme.force.chargeStrength,
		theme.force.chargeDistanceMax,
		theme.force.boundaryStrength,
		theme.node.radius,
		communities,
		clustering,
		intraDistance,
		interDistance,
		clusterStrength,
	]);
}
