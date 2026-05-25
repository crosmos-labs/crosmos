import type { ReactNode } from "react";

export interface BaseNode {
	id: string;
}

export interface BaseEdge {
	id: string;
	source: string;
	target: string;
}

export interface GraphTheme {
	node: {
		radius: number;
		fontSize: number;
		labelGap: number;
		labelColor: string;
		color: string;
		hoverColor: string;
	};
	link: {
		color: string;
		defaultAlpha: number;
		defaultWidth: number;
		highlightedWidth: number;
		curvatureSpacing: number;
		dimRgbTuple: string;
	};
	edge: {
		fontSize: number;
		labelPaddingX: number;
		labelPaddingY: number;
		labelBackgroundColor: string;
	};
	label: {
		opacityMinZoom: number;
		opacityMaxZoom: number;
		/**
		 * Zoom level above which labels stop growing in screen pixels. Below
		 * this cap, labels scale linearly with zoom (the familiar
		 * "zoom-in-makes-text-bigger" feel). At or above this cap, labels stay
		 * at a fixed screen size so neighbouring labels stop colliding as
		 * nodes spread further apart. Default `3`.
		 */
		zoomGrowthCap: number;
	};
	hover: {
		labelShiftY: number;
		hiddenLabelOpacity: number;
		animationDurationMs: number;
		highlightOpacityBoost: number;
		dimOpacity: number;
	};
	force: {
		linkDistance: number;
		chargeStrength: number;
		chargeDistanceMax: number;
		alphaDecay: number;
		velocityDecay: number;
		boundaryStrength: number;
	};
	click: {
		centerAnimationDuration: number;
		targetZoom: number;
	};
	edgeClick: {
		animationDuration: number;
		targetZoom: number;
		padding: number;
	};
	cluster: {
		/** Target link distance between two nodes in the same community. */
		intraLinkDistance: number;
		/** Target link distance for edges that bridge two different communities. */
		interLinkDistance: number;
		/** Per-tick centroid pull strength (alpha-scaled on top of this). */
		strength: number;
	};
	fontFamily: string;
}

export interface ForceGraphHandle {
	zoom: (scale: number, durationMs?: number) => void;
	zoomToFit: (durationMs?: number, paddingPx?: number) => void;
	centerAt: (x: number, y: number, durationMs?: number) => void;
	pauseAnimation: () => void;
	resumeAnimation: () => void;
	refresh: () => void;
}

export type ZoomLevelPosition =
	| "top-right"
	| "top-left"
	| "bottom-right"
	| "bottom-left";

export interface ForceGraphProps<
	TNode extends BaseNode = BaseNode,
	TEdge extends BaseEdge = BaseEdge,
> {
	nodes: TNode[];
	edges: TEdge[];
	getNodeLabel?: (node: TNode) => string;
	getNodeWeight?: (node: TNode) => number;
	getEdgeLabel?: (edge: TEdge) => string;
	onNodeClick?: (node: TNode) => void;
	onEdgeClick?: (edge: TEdge) => void;
	onBackgroundClick?: () => void;
	theme?: Partial<GraphTheme>;
	className?: string;
	"aria-label"?: string;
	emptyState?: ReactNode;
	loadingState?: ReactNode;
	isLoading?: boolean;
	/**
	 * Render the zoom-level indicator at the given corner. Pass `false` (the
	 * default) to omit it entirely.
	 */
	showZoomLevel?: false | ZoomLevelPosition;
	/**
	 * Skip Louvain community detection and the cluster-aware layout forces.
	 * When `false` (default), the layout pulls connected components into
	 * spatially distinct clusters and uses a shorter target link distance
	 * within clusters than across them.
	 */
	disableClustering?: boolean;
}
