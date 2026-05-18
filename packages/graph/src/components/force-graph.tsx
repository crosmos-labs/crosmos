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
	edge_id: string;
	curvature: number;
	parallel_index: number;
	parallel_count: number;
}

interface EdgeInfo {
	relation_type: string;
	valid_from: string | null;
	source_entity_id: string;
	target_entity_id: string;
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

function getPairKey(src: string, tgt: string): string {
	return src < tgt ? `${src}||${tgt}` : `${tgt}||${src}`;
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
	const hoveredEdgeIdRef = useRef<string | null>(null);
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

	const parallelEdgeMeta = useMemo(() => {
		const groups = new Map<string, GraphEdge[]>();

		for (const e of edges) {
			if (e.source_entity_id === e.target_entity_id) {
				continue;
			}
			const key = getPairKey(e.source_entity_id, e.target_entity_id);
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)?.push(e);
		}

		const meta = new Map<
			string,
			{ curvature: number; index: number; count: number }
		>();
		const CURVATURE_SPACING = GRAPH_CONFIG.link.curvatureSpacing;

		for (const [pairKey, group] of groups) {
			const [srcA] = pairKey.split("||");
			group.sort((a, b) => a.id.localeCompare(b.id));
			const count = group.length;
			for (let i = 0; i < count; i++) {
				const edge = group[i];
				if (!edge) continue;
				const canonicalSrc = srcA;
				const sign = edge.source_entity_id === canonicalSrc ? 1 : -1;
				const curvature =
					sign * (i - (count - 1) / 2) * CURVATURE_SPACING;
				meta.set(edge.id, { curvature, index: i, count });
			}
		}

		for (const e of edges) {
			if (e.source_entity_id === e.target_entity_id && !meta.has(e.id)) {
				meta.set(e.id, { curvature: 0, index: 0, count: 1 });
			}
		}

		return meta;
	}, [edges]);

	const rfgLinks = useMemo<RFGLink[]>(
		() =>
			edges.map((e) => {
				const meta = parallelEdgeMeta.get(e.id);
				return {
					source: e.source_entity_id,
					target: e.target_entity_id,
					color: GRAPH_CONFIG.link.color,
					relation_type: e.relation_type,
					edge_id: e.id,
					curvature: meta?.curvature ?? 0,
					parallel_index: meta?.index ?? 0,
					parallel_count: meta?.count ?? 1,
				};
			}),
		[edges, parallelEdgeMeta],
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
			map.set(e.id, {
				relation_type: e.relation_type,
				valid_from: e.valid_from,
				source_entity_id: e.source_entity_id,
				target_entity_id: e.target_entity_id,
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
					edgeSet.add(e.id);
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
			const edgeInfo = edgeMap.get(rfgLink.edge_id);
			if (!edgeInfo) return;

			const original = edges.find((e) => e.id === rfgLink.edge_id);
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

	const isEdgeHighlighted = useCallback((edgeId: string) => {
		return (
			connectedEdgesRef.current.has(edgeId) ||
			edgeId === hoveredEdgeIdRef.current
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
						hoveredEdgeIdRef.current = null;
						animateEdgeHover(0);
						return;
					}
					const rfgLink = link as unknown as RFGLink;
					hoveredEdgeIdRef.current = rfgLink.edge_id;
					edgeHoverAnimProgressRef.current = 1;
					setRenderTick((v) => v + 1);
				}}
				onNodeClick={handleNodeClick}
				onLinkClick={handleEdgeClick}
				onBackgroundClick={handleBackgroundClick}
				linkColor={(link: Record<string, unknown>) => {
					const rfgLink = link as unknown as RFGLink;
					const edgeId = rfgLink.edge_id;
					const p = hoverAnimProgressRef.current;
					const isFadeOut =
						hoveredNodeIdRef.current === null &&
						lastHoveredNodeIdRef.current !== null;
					if (isEdgeHighlighted(edgeId) && !isFadeOut) {
						return hoverConf.accentColor;
					}
					const dimmedAlpha =
						linkConf.defaultAlpha * (1 - p * (1 - hoverConf.dimOpacity));
					return `rgba(148,163,184,${dimmedAlpha.toFixed(3)})`;
				}}
				linkWidth={(link: Record<string, unknown>) => {
					const rfgLink = link as unknown as RFGLink;
					return isEdgeHighlighted(rfgLink.edge_id)
						? linkConf.highlightedWidth
						: linkConf.defaultWidth;
				}}
				linkCurvature={(link: Record<string, unknown>) => {
					const rfgLink = link as unknown as RFGLink;
					return rfgLink.curvature ?? 0;
				}}
				linkCanvasObjectMode={() => "after"}
				linkCanvasObject={(
					link: Record<string, unknown>,
					ctx: CanvasRenderingContext2D,
					globalScale: number,
				) => {
					const rfgLink = link as unknown as RFGLink;
					const edgeInfo = edgeMap.get(rfgLink.edge_id);
					if (!edgeInfo) return;
					const label = edgeInfo.relation_type;

					const srcNode = rfgLink.source as RFGNode;
					const tgtNode = rfgLink.target as RFGNode;
					if (typeof srcNode !== "object" || typeof tgtNode !== "object")
						return;

					const x1 = srcNode.x ?? 0;
					const y1 = srcNode.y ?? 0;
					const x2 = tgtNode.x ?? 0;
					const y2 = tgtNode.y ?? 0;

					const midX = (x1 + x2) / 2;
					const midY = (y1 + y2) / 2;

					const dx = x2 - x1;
					const dy = y2 - y1;
					const dist = Math.sqrt(dx * dx + dy * dy);

					let labelX = midX;
					let labelY = midY;

					if (dist > 0 && rfgLink.curvature !== 0) {
						const perpX = -dy / dist;
						const perpY = dx / dist;
						const offset = 0.5 * rfgLink.curvature * dist;
						labelX = midX + perpX * offset;
						labelY = midY + perpY * offset;
					}

					const labelOpacity = Math.min(
						1,
						Math.max(0, (globalScale - labelOpacityMin) / labelOpacityRange),
					);

					const isDirectHovered = rfgLink.edge_id === hoveredEdgeIdRef.current;
					const isFadeOut =
						hoveredNodeIdRef.current === null &&
						lastHoveredNodeIdRef.current !== null;
					const isConnectedHovered = isFadeOut
						? prevConnectedEdgesRef.current.has(rfgLink.edge_id)
						: connectedEdgesRef.current.has(rfgLink.edge_id);
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
					const bgX = labelX - textWidth / 2 - edgeConf.labelPaddingX;
					const bgY = labelY - edgeConf.fontSize / 2 - edgeConf.labelPaddingY;
					const bgW = textWidth + edgeConf.labelPaddingX * 2;
					const bgH = edgeConf.fontSize + edgeConf.labelPaddingY * 2;

					ctx.fillStyle = edgeConf.labelBackgroundColor;
					ctx.fillRect(bgX, bgY, bgW, bgH);

					ctx.fillStyle = nodeConf.labelColor;
					ctx.fillText(label, labelX, labelY);
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
