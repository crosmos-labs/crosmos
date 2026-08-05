"use client";

import {
	type MouseEvent as ReactMouseEvent,
	type Ref,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import type {
	ForceGraphMethods,
	LinkObject as RFGLinkObject,
	NodeObject as RFGNodeObject,
} from "react-force-graph-2d";
import { mergeTheme } from "../constants/graph";
import { useElementSize } from "../hooks/use-element-size";
import { useGraphLayout } from "../hooks/use-graph-layout";
import { useHoverAnimation } from "../hooks/use-hover-animation";
import { useParallelEdges } from "../hooks/use-parallel-edges";
import { usePrefersReducedMotion } from "../hooks/use-reduced-motion";
import { useForceGraph2D } from "../hooks/use-rfg-loader";
import { computeCommunities } from "../layout/communities";
import { createPaintCache } from "../paint/cache";
import {
	createLinkColor,
	createLinkPainter,
	createLinkPointerAreaPaint,
	createLinkWidth,
} from "../paint/link";
import { createNodePainter } from "../paint/node";
import type { PaintHoverState, RFGLink, RFGNode } from "../paint/types";
import type {
	BaseEdge,
	BaseNode,
	ForceGraphHandle,
	ForceGraphProps,
} from "../types/public";

type RFGRef<TNodeType, TLinkType> = ForceGraphMethods<
	RFGNodeObject<TNodeType>,
	RFGLinkObject<TNodeType, TLinkType>
>;

type AnyRfgRef = RFGRef<RFGNode, RFGLink>;

// `refresh` exists on the kapsule at runtime but is missing from rfg-2d's .d.ts.
type RuntimeExtras = { refresh?: () => unknown };

// `theme.link.defaultWidth` (0.5) + the lib's default `linkHoverPrecision` (4),
// so our shadow line matches the lib's default hit zone width.
const LINK_HIT_LINE_WIDTH = 0.5 + 4;

// Absorbs the lib's 800ms shadow-canvas throttle: while the sim is hot, the
// visible node can briefly drift off the stale shadow and trigger a false
// hover-out. Holding the hover-out for ~80ms swallows that flicker.
const HOVER_OUT_DEBOUNCE_MS = 80;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

function clampZoom(scale: number): number {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
}

function defaultNodeLabel<TNode extends BaseNode>(n: TNode): string {
	const candidate = n as unknown as { label?: unknown; name?: unknown };
	if (typeof candidate.label === "string") return candidate.label;
	if (typeof candidate.name === "string") return candidate.name;
	return n.id;
}

function defaultNodeWeight<TNode extends BaseNode>(n: TNode): number {
	const candidate = n as unknown as { weight?: unknown };
	return typeof candidate.weight === "number" ? candidate.weight : 0;
}

function defaultEdgeLabel<TEdge extends BaseEdge>(e: TEdge): string {
	const candidate = e as unknown as { label?: unknown };
	return typeof candidate.label === "string" ? candidate.label : "";
}

export function ForceGraph<
	TNode extends BaseNode = BaseNode,
	TEdge extends BaseEdge = BaseEdge,
>(props: ForceGraphProps<TNode, TEdge> & { ref?: Ref<ForceGraphHandle> }) {
	const {
		nodes,
		edges,
		getNodeLabel = defaultNodeLabel<TNode>,
		getNodeWeight = defaultNodeWeight<TNode>,
		getEdgeLabel = defaultEdgeLabel<TEdge>,
		onNodeClick,
		onEdgeClick,
		onBackgroundClick,
		theme: themeOverride,
		className,
		"aria-label": ariaLabel = "Knowledge graph",
		emptyState,
		loadingState,
		isLoading,
		showZoomLevel = false,
		disableClustering = false,
		ref,
	} = props;

	const theme = useMemo(() => mergeTheme(themeOverride), [themeOverride]);
	const containerRef = useRef<HTMLDivElement>(null);
	const zoomLabelRef = useRef<HTMLDivElement>(null);
	const fgRef = useRef<AnyRfgRef | null>(null);

	const reducedMotion = usePrefersReducedMotion();
	const hover = useHoverAnimation({
		durationMs: theme.hover.animationDurationMs,
		reducedMotion,
	});

	const hoveredNodeIdRef = useRef<string | null>(null);
	const lastHoveredNodeIdRef = useRef<string | null>(null);
	const hoveredEdgeIdRef = useRef<string | null>(null);
	const connectedEdgesRef = useRef<Set<string>>(new Set());
	const connectedNodeIdsRef = useRef<Set<string>>(new Set());
	const prevConnectedEdgesRef = useRef<Set<string>>(new Set());
	const prevConnectedNodeIdsRef = useRef<Set<string>>(new Set());

	const ForceGraph2D = useForceGraph2D();
	const dimensions = useElementSize(containerRef);

	const nodeMap = useMemo(() => {
		const m = new Map<string, TNode>();
		for (const n of nodes) m.set(n.id, n);
		return m;
	}, [nodes]);

	const edgeMap = useMemo(() => {
		const m = new Map<string, TEdge>();
		for (const e of edges) m.set(e.id, e);
		return m;
	}, [edges]);

	const parallelEdgeMeta = useParallelEdges(edges, theme.link.curvatureSpacing);

	const rfgNodes = useMemo<RFGNode[]>(
		() =>
			nodes.map((n) => ({
				id: n.id,
				label: getNodeLabel(n),
				weight: getNodeWeight(n),
			})),
		[nodes, getNodeLabel, getNodeWeight],
	);

	const rfgLinks = useMemo<RFGLink[]>(
		() =>
			edges
				// Paged APIs can return edges whose other endpoint is outside the
				// returned node set; d3-force throws on missing endpoints.
				.filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
				.map((e) => {
					const meta = parallelEdgeMeta.get(e.id);
					return {
						source: e.source,
						target: e.target,
						edgeId: e.id,
						label: getEdgeLabel(e),
						curvature: meta?.curvature ?? 0,
						parallelIndex: meta?.index ?? 0,
						parallelCount: meta?.count ?? 1,
					};
				}),
		[edges, nodeMap, parallelEdgeMeta, getEdgeLabel],
	);

	const graphData = useMemo(
		() => ({ nodes: rfgNodes, links: rfgLinks }),
		[rfgNodes, rfgLinks],
	);

	const dynamicLinkDistance = useMemo(() => {
		const baseDistance = theme.force.linkDistance;
		const nodeCount = nodes.length;
		if (nodeCount <= 50) return baseDistance;
		const relativeGrowth = (nodeCount - 50) / 50;
		const multiplier = Math.min(3, 1 + Math.log1p(relativeGrowth));
		return baseDistance * multiplier;
	}, [nodes.length, theme.force.linkDistance]);

	const communities = useMemo(
		() =>
			disableClustering
				? new Map<string, number>()
				: computeCommunities(nodes, edges),
		[disableClustering, nodes, edges],
	);

	useGraphLayout(
		fgRef as unknown as React.MutableRefObject<{
			d3Force: (n: string, f: unknown) => unknown;
			d3ReheatSimulation: () => unknown;
		} | null>,
		Boolean(ForceGraph2D),
		dynamicLinkDistance,
		theme,
		communities,
	);

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
			const nodeSet = new Set<string>([nodeId]);
			for (const e of edges) {
				if (e.source === nodeId || e.target === nodeId) {
					edgeSet.add(e.id);
					nodeSet.add(e.source);
					nodeSet.add(e.target);
				}
			}
			connectedEdgesRef.current = edgeSet;
			connectedNodeIdsRef.current = nodeSet;
		},
		[edges],
	);

	const paintHoverState = useMemo<PaintHoverState>(
		() => ({
			get hoveredNodeId() {
				return hoveredNodeIdRef.current;
			},
			get lastHoveredNodeId() {
				return lastHoveredNodeIdRef.current;
			},
			get hoveredEdgeId() {
				return hoveredEdgeIdRef.current;
			},
			get connectedEdges() {
				return connectedEdgesRef.current;
			},
			get connectedNodeIds() {
				return connectedNodeIdsRef.current;
			},
			get prevConnectedEdges() {
				return prevConnectedEdgesRef.current;
			},
			get prevConnectedNodeIds() {
				return prevConnectedNodeIdsRef.current;
			},
			getNodeProgress: hover.getNodeProgress,
			getEdgeProgress: hover.getEdgeProgress,
		}),
		[hover.getNodeProgress, hover.getEdgeProgress],
	);

	const paintCache = useMemo(() => createPaintCache(theme), [theme]);

	const paintNode = useMemo(
		() => createNodePainter(paintCache, paintHoverState),
		[paintCache, paintHoverState],
	);
	const paintLink = useMemo(
		() => createLinkPainter(paintCache, paintHoverState),
		[paintCache, paintHoverState],
	);
	const linkColor = useMemo(
		() => createLinkColor(paintCache, paintHoverState, theme.node.hoverColor),
		[paintCache, paintHoverState, theme.node.hoverColor],
	);
	const linkWidth = useMemo(
		() => createLinkWidth(paintCache, paintHoverState),
		[paintCache, paintHoverState],
	);
	const linkPointerAreaPaint = useMemo(
		() => createLinkPointerAreaPaint(paintCache, LINK_HIT_LINE_WIDTH),
		[paintCache],
	);

	useImperativeHandle(
		ref,
		(): ForceGraphHandle => ({
			zoom: (scale, ms) => void fgRef.current?.zoom(clampZoom(scale), ms),
			zoomToFit: (ms, padding) => void fgRef.current?.zoomToFit(ms, padding),
			centerAt: (x, y, ms) => void fgRef.current?.centerAt(x, y, ms),
			pauseAnimation: () => void fgRef.current?.pauseAnimation(),
			resumeAnimation: () => void fgRef.current?.resumeAnimation(),
			refresh: () => {
				const ex = fgRef.current as unknown as RuntimeExtras | null;
				ex?.refresh?.();
			},
		}),
		[],
	);

	const handleZoom = useCallback((e: { k: number }) => {
		if (zoomLabelRef.current) {
			zoomLabelRef.current.textContent = `${Math.round(e.k * 100)}%`;
		}
	}, []);

	const handleNodeClick = useCallback(
		(node: RFGNode) => {
			const original = nodeMap.get(node.id);
			if (!original) return;
			const fg = fgRef.current;
			if (fg) {
				fg.centerAt(
					node.x ?? 0,
					node.y ?? 0,
					theme.click.centerAnimationDuration,
				);
				fg.zoom(
					clampZoom(theme.click.targetZoom),
					theme.click.centerAnimationDuration,
				);
			}
			onNodeClick?.(original);
		},
		[
			nodeMap,
			onNodeClick,
			theme.click.centerAnimationDuration,
			theme.click.targetZoom,
		],
	);

	const handleEdgeClick = useCallback(
		(link: RFGLink) => {
			const original = edgeMap.get(link.edgeId);
			if (!original) return;

			const src = link.source;
			const tgt = link.target;
			if (typeof src !== "object" || typeof tgt !== "object") return;

			const sx = (src as RFGNode).x ?? 0;
			const sy = (src as RFGNode).y ?? 0;
			const tx = (tgt as RFGNode).x ?? 0;
			const ty = (tgt as RFGNode).y ?? 0;

			const fg = fgRef.current;
			if (fg) {
				fg.centerAt(
					(sx + tx) / 2,
					(sy + ty) / 2,
					theme.edgeClick.animationDuration,
				);
				fg.zoom(
					clampZoom(theme.edgeClick.targetZoom),
					theme.edgeClick.animationDuration,
				);
			}
			onEdgeClick?.(original);
		},
		[
			edgeMap,
			onEdgeClick,
			theme.edgeClick.animationDuration,
			theme.edgeClick.targetZoom,
		],
	);

	const handleBackgroundClick = useCallback(
		(_e: MouseEvent) => {
			onBackgroundClick?.();
		},
		[onBackgroundClick],
	);

	const nodeHoverOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);
	const linkHoverOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	useEffect(() => {
		return () => {
			if (nodeHoverOutTimerRef.current !== null) {
				clearTimeout(nodeHoverOutTimerRef.current);
			}
			if (linkHoverOutTimerRef.current !== null) {
				clearTimeout(linkHoverOutTimerRef.current);
			}
		};
	}, []);

	const commitNodeHoverOut = useCallback(() => {
		nodeHoverOutTimerRef.current = null;
		hoveredNodeIdRef.current = null;
		rebuildConnectedEdges(null);
		hover.animateNodeTo(0, () => {
			lastHoveredNodeIdRef.current = null;
			prevConnectedEdgesRef.current = new Set();
			prevConnectedNodeIdsRef.current = new Set();
		});
	}, [hover, rebuildConnectedEdges]);

	const handleNodeHover = useCallback(
		(node: RFGNode | null) => {
			const id = node ? node.id : null;

			if (id === null) {
				if (nodeHoverOutTimerRef.current === null) {
					nodeHoverOutTimerRef.current = setTimeout(
						commitNodeHoverOut,
						HOVER_OUT_DEBOUNCE_MS,
					);
				}
				return;
			}

			if (nodeHoverOutTimerRef.current !== null) {
				clearTimeout(nodeHoverOutTimerRef.current);
				nodeHoverOutTimerRef.current = null;
			}

			const prevId = hoveredNodeIdRef.current;
			hoveredNodeIdRef.current = id;
			rebuildConnectedEdges(id);
			lastHoveredNodeIdRef.current = id;

			if (prevId) {
				hover.jumpNodeTo(1);
			} else {
				hover.animateNodeTo(1);
			}
		},
		[hover, rebuildConnectedEdges, commitNodeHoverOut],
	);

	const commitLinkHoverOut = useCallback(() => {
		linkHoverOutTimerRef.current = null;
		hoveredEdgeIdRef.current = null;
		hover.animateEdgeTo(0);
	}, [hover]);

	const handleLinkHover = useCallback(
		(link: RFGLink | null) => {
			if (!link) {
				if (linkHoverOutTimerRef.current === null) {
					linkHoverOutTimerRef.current = setTimeout(
						commitLinkHoverOut,
						HOVER_OUT_DEBOUNCE_MS,
					);
				}
				return;
			}
			if (linkHoverOutTimerRef.current !== null) {
				clearTimeout(linkHoverOutTimerRef.current);
				linkHoverOutTimerRef.current = null;
			}
			hoveredEdgeIdRef.current = link.edgeId;
			hover.jumpEdgeTo(1);
		},
		[hover, commitLinkHoverOut],
	);

	if (nodes.length === 0 && !isLoading) {
		return (
			<div
				ref={containerRef}
				className={className ?? "cg-root cg-empty"}
				role="img"
				aria-label={ariaLabel}
				aria-busy={isLoading}
			>
				{emptyState ?? (
					<span className="cg-empty-text">No entities to display</span>
				)}
			</div>
		);
	}

	if (nodes.length === 0 && isLoading) {
		return (
			<div
				ref={containerRef}
				className={className ?? "cg-root"}
				role="img"
				aria-label={ariaLabel}
				aria-busy
			>
				{loadingState}
			</div>
		);
	}

	if (!ForceGraph2D) {
		return (
			<div
				ref={containerRef}
				className={className ?? "cg-root"}
				role="img"
				aria-label={ariaLabel}
				aria-busy
			>
				{loadingState}
			</div>
		);
	}

	const FG = ForceGraph2D as unknown as React.ComponentType<
		Record<string, unknown>
	>;

	return (
		<div
			ref={containerRef}
			className={className ?? "cg-root"}
			role="img"
			aria-label={ariaLabel}
			aria-busy={isLoading}
		>
			{showZoomLevel && (
				<div
					ref={zoomLabelRef}
					className={`cg-zoom-label cg-zoom-label--${showZoomLevel}`}
				>
					100%
				</div>
			)}
			<FG
				ref={fgRef}
				graphData={graphData}
				width={dimensions.width}
				height={dimensions.height}
				minZoom={MIN_ZOOM}
				maxZoom={MAX_ZOOM}
				onZoom={showZoomLevel ? handleZoom : undefined}
				nodeLabel=""
				linkLabel=""
				autoPauseRedraw={!hover.isAnimating}
				onNodeHover={handleNodeHover as unknown as (n: unknown) => void}
				onLinkHover={handleLinkHover as unknown as (l: unknown) => void}
				onNodeClick={
					handleNodeClick as unknown as (n: unknown, e: ReactMouseEvent) => void
				}
				onLinkClick={
					handleEdgeClick as unknown as (l: unknown, e: ReactMouseEvent) => void
				}
				onBackgroundClick={
					handleBackgroundClick as unknown as (e: MouseEvent) => void
				}
				linkColor={linkColor as unknown as (l: unknown) => string}
				linkWidth={linkWidth as unknown as (l: unknown) => number}
				linkCurvature={(l: RFGLink) => l.curvature ?? 0}
				linkCanvasObjectMode={() => "after"}
				linkCanvasObject={
					paintLink as unknown as (
						l: unknown,
						ctx: CanvasRenderingContext2D,
						scale: number,
					) => void
				}
				linkPointerAreaPaint={
					linkPointerAreaPaint as unknown as (
						l: unknown,
						color: string,
						ctx: CanvasRenderingContext2D,
						scale: number,
					) => void
				}
				nodeCanvasObjectMode={() => "replace"}
				nodeCanvasObject={
					paintNode as unknown as (
						n: unknown,
						ctx: CanvasRenderingContext2D,
						scale: number,
					) => void
				}
				d3AlphaDecay={theme.force.alphaDecay}
				d3VelocityDecay={theme.force.velocityDecay}
			/>
		</div>
	);
}
