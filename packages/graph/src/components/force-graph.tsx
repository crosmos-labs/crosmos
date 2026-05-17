"use client";

import {
	forceCollide,
	forceLink,
	forceManyBody,
	forceX,
	forceY,
} from "d3-force";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GRAPH_CONFIG } from "../constants/graph";
import type { GraphEdge, GraphNode } from "../types";

interface RFGNode {
	id: string;
	name: string;
	entity_type: string | null;
	edge_count: number;
	color: string;
	x?: number;
	y?: number;
}

interface RFGLink {
	source: RFGNode | string;
	target: RFGNode | string;
	color: string;
	relation_type: string;
}

interface EdgeInfo {
	relation_type: string;
	valid_from: string | null;
}

interface ForceGraphProps {
	nodes: GraphNode[];
	edges: GraphEdge[];
	spaceId: string;
	onNodeClick?: (node: GraphNode) => void;
	onEdgeClick?: (edge: GraphEdge) => void;
	onBackgroundClick?: () => void;
}

const HOVER_ANIM_MS = GRAPH_CONFIG.hover.animationDurationMs;

function getEdgeKey(link: RFGLink | Record<string, unknown>): string {
	const src =
		typeof (link as RFGLink).source === "object"
			? ((link as RFGLink).source as RFGNode).id
			: ((link as RFGLink).source as string);
	const tgt =
		typeof (link as RFGLink).target === "object"
			? ((link as RFGLink).target as RFGNode).id
			: ((link as RFGLink).target as string);
	return `${src}->${tgt}`;
}

export function ForceGraph({
	nodes,
	edges,
	spaceId,
	onNodeClick,
	onEdgeClick,
	onBackgroundClick,
}: ForceGraphProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const zoomLabelRef = useRef<HTMLDivElement>(null);
	const fgRef = useRef<Record<string, unknown> | null>(null);
	const hoveredNodeIdRef = useRef<string | null>(null);
	const lastHoveredNodeIdRef = useRef<string | null>(null);
	const hoverAnimProgressRef = useRef(0);
	const animFrameRef = useRef(0);
	const connectedEdgesRef = useRef<Set<string>>(new Set());
	const connectedNodeIdsRef = useRef<Set<string>>(new Set());
	const prevConnectedEdgesRef = useRef<Set<string>>(new Set());
	const prevConnectedNodeIdsRef = useRef<Set<string>>(new Set());
	const hoveredEdgeKeyRef = useRef<string | null>(null);
	const edgeHoverAnimProgressRef = useRef(0);
	const edgeAnimFrameRef = useRef(0);
	const [ForceGraph2D, setForceGraph2D] = useState<React.ComponentType<
		Record<string, unknown>
	> | null>(null);
	const [dimensions, setDimensions] = useState<{
		width: number;
		height: number;
	}>({
		width: 800,
		height: 600,
	});
	const [renderTick, setRenderTick] = useState(0);

	const rfgNodes = useMemo<RFGNode[]>(
		() =>
			nodes.map((n) => ({
				id: n.id,
				name: n.name,
				entity_type: n.entity_type,
				edge_count: n.edge_count,
				color: GRAPH_CONFIG.node.color,
			})),
		[nodes],
	);

	const rfgLinks = useMemo<RFGLink[]>(
		() =>
			edges.map((e) => ({
				source: e.source_entity_id,
				target: e.target_entity_id,
				color: GRAPH_CONFIG.link.color,
				relation_type: e.relation_type,
			})),
		[edges],
	);

	const graphData = useMemo(
		() => ({ nodes: rfgNodes, links: rfgLinks }),
		[rfgNodes, rfgLinks],
	);

	const dynamicLinkDistance = useMemo(() => {
		const baseDistance = GRAPH_CONFIG.force.linkDistance;
		const nodeCount = nodes.length;
		if (nodeCount <= 50) {
			return baseDistance;
		}
		const relativeGrowth = (nodeCount - 50) / 50;
		const multiplier = Math.min(3, 1 + Math.log1p(relativeGrowth));
		return baseDistance * multiplier;
	}, [nodes.length]);

	const nodeMap = useMemo(() => {
		const map = new Map<string, GraphNode>();
		for (const n of nodes) {
			map.set(n.id, n);
		}
		return map;
	}, [nodes]);

	const edgeMap = useMemo(() => {
		const map = new Map<string, EdgeInfo>();
		for (const e of edges) {
			map.set(`${e.source_entity_id}->${e.target_entity_id}`, {
				relation_type: e.relation_type,
				valid_from: e.valid_from,
			});
		}
		return map;
	}, [edges]);

	const rebuildConnectedEdges = useCallback(
		(nodeId: string | null) => {
			if (!nodeId) {
				prevConnectedEdgesRef.current = new Set(connectedEdgesRef.current);
				prevConnectedNodeIdsRef.current = new Set(connectedNodeIdsRef.current);
				connectedEdgesRef.current = new Set();
				connectedNodeIdsRef.current = new Set();
				return;
			}
			const edgeSet = new Set<string>();
			const nodeSet = new Set<string>();
			nodeSet.add(nodeId);
			for (const e of edges) {
				if (e.source_entity_id === nodeId || e.target_entity_id === nodeId) {
					edgeSet.add(`${e.source_entity_id}->${e.target_entity_id}`);
					nodeSet.add(e.source_entity_id);
					nodeSet.add(e.target_entity_id);
				}
			}
			connectedEdgesRef.current = edgeSet;
			connectedNodeIdsRef.current = nodeSet;
		},
		[edges],
	);

	const animateHover = useCallback((target: number) => {
		const startTime = performance.now();
		const startValue = hoverAnimProgressRef.current;
		const diff = target - startValue;

		if (Math.abs(diff) < 0.01) {
			hoverAnimProgressRef.current = target;
			if (target === 0) {
				lastHoveredNodeIdRef.current = null;
				prevConnectedEdgesRef.current = new Set();
				prevConnectedNodeIdsRef.current = new Set();
			}
			return;
		}

		cancelAnimationFrame(animFrameRef.current);

		const step = (now: number) => {
			const elapsed = now - startTime;
			const t = Math.min(elapsed / HOVER_ANIM_MS, 1);
			const eased = 1 - (1 - t) ** 3;
			hoverAnimProgressRef.current = startValue + diff * eased;
			setRenderTick((v) => v + 1);
			if (t < 1) {
				animFrameRef.current = requestAnimationFrame(step);
			} else if (target === 0) {
				lastHoveredNodeIdRef.current = null;
				prevConnectedEdgesRef.current = new Set();
				prevConnectedNodeIdsRef.current = new Set();
			}
		};
		animFrameRef.current = requestAnimationFrame(step);
	}, []);

	const animateEdgeHover = useCallback((target: number) => {
		const startTime = performance.now();
		const startValue = edgeHoverAnimProgressRef.current;
		const diff = target - startValue;

		if (Math.abs(diff) < 0.01) {
			edgeHoverAnimProgressRef.current = target;
			return;
		}

		cancelAnimationFrame(edgeAnimFrameRef.current);

		const step = (now: number) => {
			const elapsed = now - startTime;
			const t = Math.min(elapsed / HOVER_ANIM_MS, 1);
			const eased = 1 - (1 - t) ** 3;
			edgeHoverAnimProgressRef.current = startValue + diff * eased;
			setRenderTick((v) => v + 1);
			if (t < 1) {
				edgeAnimFrameRef.current = requestAnimationFrame(step);
			}
		};
		edgeAnimFrameRef.current = requestAnimationFrame(step);
	}, []);

	useEffect(() => {
		return () => {
			cancelAnimationFrame(animFrameRef.current);
			cancelAnimationFrame(edgeAnimFrameRef.current);
		};
	}, []);

	useEffect(() => {
		import("react-force-graph-2d").then((mod) => {
			setForceGraph2D(() => mod.default);
		});
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				setDimensions({
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				});
			}
		});

		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!ForceGraph2D) return;
		const fg = fgRef.current;
		if (!fg) return;

		const fgApi = fg as unknown as {
			d3Force: (name: string, forceFn: unknown) => unknown;
			d3ReheatSimulation: () => void;
		};

		const collisionRadiusBase = GRAPH_CONFIG.node.radius * 2.5;
		fgApi.d3Force(
			"link",
			forceLink()
				.id(
					((d: unknown) =>
						(d as Record<string, unknown>).id as string) as never,
				)
				.distance(dynamicLinkDistance),
		);
		fgApi.d3Force(
			"charge",
			forceManyBody()
				.strength(GRAPH_CONFIG.force.chargeStrength)
				.distanceMax(GRAPH_CONFIG.force.chargeDistanceMax),
		);
		fgApi.d3Force(
			"collide",
			forceCollide<RFGNode>()
				.radius((node) => {
					const degreeBoost = Math.min(1.75, 1 + (node.edge_count ?? 0) * 0.05);
					return collisionRadiusBase * degreeBoost;
				})
				.strength(0.7)
				.iterations(4),
		);
		fgApi.d3Force("x", forceX().strength(GRAPH_CONFIG.force.boundaryStrength));
		fgApi.d3Force("y", forceY().strength(GRAPH_CONFIG.force.boundaryStrength));

		fgApi.d3ReheatSimulation();
	}, [ForceGraph2D, dynamicLinkDistance]);

	const handleZoom = useCallback((e: { k: number }) => {
		if (zoomLabelRef.current) {
			zoomLabelRef.current.textContent = `${Math.round(e.k * 100)}%`;
		}
	}, []);

	const handleNodeClick = useCallback(
		(node: Record<string, unknown>) => {
			const id = node.id as string;
			const original = nodeMap.get(id);
			if (!original) return;

			const fgApi = fgRef.current as unknown as {
				centerAt: (x?: number, y?: number, durationMs?: number) => unknown;
				zoom: (scale: number, durationMs?: number) => unknown;
			};

			const { centerAnimationDuration, targetZoom } = GRAPH_CONFIG.click;
			fgApi.centerAt(
				node.x as number,
				node.y as number,
				centerAnimationDuration,
			);
			fgApi.zoom(targetZoom, centerAnimationDuration);

			onNodeClick?.(original);
		},
		[nodeMap, onNodeClick],
	);

	const handleEdgeClick = useCallback(
		(link: Record<string, unknown>) => {
			const rfgLink = link as unknown as RFGLink;
			const key = getEdgeKey(rfgLink);
			const edgeInfo = edgeMap.get(key);
			if (!edgeInfo) return;

			const original = edges.find(
				(e) => `${e.source_entity_id}->${e.target_entity_id}` === key,
			);
			if (!original) return;

			const srcNode = rfgLink.source;
			const tgtNode = rfgLink.target;
			if (typeof srcNode !== "object" || typeof tgtNode !== "object") return;

			const fgApi = fgRef.current as unknown as {
				centerAt: (x?: number, y?: number, durationMs?: number) => unknown;
				zoom: (scale: number, durationMs?: number) => unknown;
			};

			const midX =
				((srcNode as RFGNode).x ?? 0) / 2 + ((tgtNode as RFGNode).x ?? 0) / 2;
			const midY =
				((srcNode as RFGNode).y ?? 0) / 2 + ((tgtNode as RFGNode).y ?? 0) / 2;

			const { animationDuration, targetZoom } = GRAPH_CONFIG.edgeClick;
			fgApi.centerAt(midX, midY, animationDuration);
			fgApi.zoom(targetZoom, animationDuration);

			onEdgeClick?.(original);
		},
		[edges, edgeMap, onEdgeClick],
	);

	const handleBackgroundClick = useCallback(() => {
		onBackgroundClick?.();
	}, [onBackgroundClick]);

	const isEdgeHighlighted = useCallback((key: string) => {
		return (
			connectedEdgesRef.current.has(key) || key === hoveredEdgeKeyRef.current
		);
	}, []);

	if (nodes.length === 0) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
				No entities to display
			</div>
		);
	}

	if (!ForceGraph2D) {
		return <div ref={containerRef} className="h-full w-full" />;
	}

	const {
		node: nodeConf,
		link: linkConf,
		edge: edgeConf,
		label: labelConf,
		hover: hoverConf,
	} = GRAPH_CONFIG;
	const labelOpacityMin = labelConf.opacityMinZoom;
	const labelOpacityMax = labelConf.opacityMaxZoom;
	const labelOpacityRange = labelOpacityMax - labelOpacityMin;

	void renderTick;

	return (
		<div ref={containerRef} className="h-full w-full relative">
			<div
				ref={zoomLabelRef}
				className="absolute top-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-mono text-white z-10"
			>
				100%
			</div>
			<ForceGraph2D
				ref={fgRef}
				graphData={graphData}
				onZoom={handleZoom}
				nodeLabel=""
				linkLabel=""
				onNodeHover={(node: Record<string, unknown> | null) => {
					const id = node ? (node.id as string) : null;
					const prevId = hoveredNodeIdRef.current;
					hoveredNodeIdRef.current = id;
					rebuildConnectedEdges(id);

					if (id) {
						lastHoveredNodeIdRef.current = id;
					}

					if (id && prevId) {
						hoverAnimProgressRef.current = 1;
						setRenderTick((v) => v + 1);
					} else if (id) {
						animateHover(1);
					} else {
						animateHover(0);
					}
				}}
				onLinkHover={(link: Record<string, unknown> | null) => {
					if (!link) {
						hoveredEdgeKeyRef.current = null;
						animateEdgeHover(0);
						return;
					}
					const key = getEdgeKey(link as unknown as RFGLink);
					hoveredEdgeKeyRef.current = key;
					edgeHoverAnimProgressRef.current = 1;
					setRenderTick((v) => v + 1);
				}}
				onNodeClick={handleNodeClick}
				onLinkClick={handleEdgeClick}
				onBackgroundClick={handleBackgroundClick}
				linkColor={(link: Record<string, unknown>) => {
					const key = getEdgeKey(link as unknown as RFGLink);
					const p = hoverAnimProgressRef.current;
					const isFadeOut =
						hoveredNodeIdRef.current === null &&
						lastHoveredNodeIdRef.current !== null;
					if (isEdgeHighlighted(key) && !isFadeOut) {
						return hoverConf.accentColor;
					}
					const dimmedAlpha =
						linkConf.defaultAlpha * (1 - p * (1 - hoverConf.dimOpacity));
					return `rgba(148,163,184,${dimmedAlpha.toFixed(3)})`;
				}}
				linkWidth={(link: Record<string, unknown>) => {
					const key = getEdgeKey(link as unknown as RFGLink);
					return isEdgeHighlighted(key)
						? linkConf.highlightedWidth
						: linkConf.defaultWidth;
				}}
				linkCanvasObjectMode={() => "after"}
				linkCanvasObject={(
					link: Record<string, unknown>,
					ctx: CanvasRenderingContext2D,
					globalScale: number,
				) => {
					const rfgLink = link as unknown as RFGLink;
					const key = getEdgeKey(rfgLink);
					const edgeInfo = edgeMap.get(key);
					if (!edgeInfo) return;
					const label = edgeInfo.relation_type;

					const srcNode = rfgLink.source as RFGNode;
					const tgtNode = rfgLink.target as RFGNode;
					if (typeof srcNode !== "object" || typeof tgtNode !== "object")
						return;

					const midX = ((srcNode.x ?? 0) + (tgtNode.x ?? 0)) / 2;
					const midY = ((srcNode.y ?? 0) + (tgtNode.y ?? 0)) / 2;

					const labelOpacity = Math.min(
						1,
						Math.max(0, (globalScale - labelOpacityMin) / labelOpacityRange),
					);

					const isDirectHovered = key === hoveredEdgeKeyRef.current;
					const isFadeOut =
						hoveredNodeIdRef.current === null &&
						lastHoveredNodeIdRef.current !== null;
					const isConnectedHovered = isFadeOut
						? prevConnectedEdgesRef.current.has(key)
						: connectedEdgesRef.current.has(key);
					const isEdgeActive = isDirectHovered || isConnectedHovered;
					const p = hoverAnimProgressRef.current;

					const dimFactor = isEdgeActive
						? 1
						: 1 - p * (1 - hoverConf.dimOpacity);

					const ep = isDirectHovered ? edgeHoverAnimProgressRef.current : 0;

					const shouldShowLabel = labelOpacity > 0 || ep > 0;
					if (!shouldShowLabel && !isConnectedHovered) return;

					const baseOpacity = labelOpacity;
					const targetOpacity =
						baseOpacity <= 0
							? hoverConf.hiddenLabelOpacity
							: Math.max(baseOpacity, hoverConf.highlightOpacityBoost);
					const effectiveOpacity = isEdgeActive
						? baseOpacity +
							ep * (targetOpacity - baseOpacity) +
							(isConnectedHovered && !isDirectHovered
								? targetOpacity - baseOpacity
								: 0)
						: baseOpacity;

					const clampedOpacity = Math.min(1, Math.max(0, effectiveOpacity));

					ctx.globalAlpha = isEdgeActive
						? clampedOpacity
						: clampedOpacity * dimFactor;
					ctx.font = `${edgeConf.fontSize}px Satoshi, Inter, ui-sans-serif, system-ui, sans-serif`;
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";

					const textWidth = ctx.measureText(label).width;
					const bgX = midX - textWidth / 2 - edgeConf.labelPaddingX;
					const bgY = midY - edgeConf.fontSize / 2 - edgeConf.labelPaddingY;
					const bgW = textWidth + edgeConf.labelPaddingX * 2;
					const bgH = edgeConf.fontSize + edgeConf.labelPaddingY * 2;

					ctx.fillStyle = edgeConf.labelBackgroundColor;
					ctx.fillRect(bgX, bgY, bgW, bgH);

					ctx.fillStyle = nodeConf.labelColor;
					ctx.fillText(label, midX, midY);
					ctx.globalAlpha = 1;
				}}
				d3AlphaDecay={GRAPH_CONFIG.force.alphaDecay}
				d3VelocityDecay={GRAPH_CONFIG.force.velocityDecay}
				nodeCanvasObjectMode={() => "replace"}
				nodeCanvasObject={(
					node: Record<string, unknown>,
					ctx: CanvasRenderingContext2D,
					globalScale: number,
				) => {
					const nodeId = node.id as string;
					const label = node.name as string;
					const nodeRadius = nodeConf.radius;
					const fontSize = nodeConf.fontSize;
					const labelGap = nodeConf.labelGap;
					const isHovered = hoveredNodeIdRef.current === nodeId;
					const isFadingOut =
						hoveredNodeIdRef.current === null &&
						lastHoveredNodeIdRef.current !== null;
					const wasHovered = lastHoveredNodeIdRef.current === nodeId;
					const isConnected = isFadingOut
						? prevConnectedNodeIdsRef.current.has(nodeId)
						: connectedNodeIdsRef.current.has(nodeId);
					const p = hoverAnimProgressRef.current;

					const isHighlighted = isHovered || isConnected || wasHovered;
					const dimFactor = isHighlighted
						? 1
						: 1 - p * (1 - hoverConf.dimOpacity);

					const labelOpacity = Math.min(
						1,
						Math.max(0, (globalScale - labelOpacityMin) / labelOpacityRange),
					);

					const fillColor =
						isHovered || (isFadingOut && wasHovered)
							? hoverConf.accentColor
							: (node.color as string);

					const hoverLabelProgress =
						isHovered || (isFadingOut && wasHovered) ? p : 0;
					const shouldShowLabel = labelOpacity > 0 || hoverLabelProgress > 0;

					if (!shouldShowLabel) {
						ctx.globalAlpha = dimFactor;
						ctx.beginPath();
						ctx.arc(
							node.x as number,
							node.y as number,
							nodeRadius,
							0,
							2 * Math.PI,
						);
						ctx.fillStyle = fillColor;
						ctx.fill();
						ctx.globalAlpha = 1;
						return;
					}

					const targetOpacity =
						labelOpacity <= 0
							? hoverConf.hiddenLabelOpacity
							: Math.max(labelOpacity, hoverConf.highlightOpacityBoost);
					const effectiveOpacity =
						labelOpacity + hoverLabelProgress * (targetOpacity - labelOpacity);
					const labelYOffset = hoverLabelProgress * hoverConf.labelShiftY;

					ctx.font = `${fontSize}px Satoshi, Inter, ui-sans-serif, system-ui, sans-serif`;
					ctx.textAlign = "center";
					ctx.textBaseline = "top";

					ctx.globalAlpha = dimFactor;
					ctx.beginPath();
					ctx.arc(
						node.x as number,
						node.y as number,
						nodeRadius,
						0,
						2 * Math.PI,
					);
					ctx.fillStyle = fillColor;
					ctx.fill();

					ctx.globalAlpha = isHighlighted
						? effectiveOpacity
						: effectiveOpacity * dimFactor;
					ctx.fillStyle = nodeConf.labelColor;
					ctx.fillText(
						label,
						node.x as number,
						(node.y as number) + nodeRadius + labelGap + labelYOffset,
					);
					ctx.globalAlpha = 1;
				}}
				width={dimensions.width}
				height={dimensions.height}
			/>
		</div>
	);
}
