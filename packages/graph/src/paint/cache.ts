import type { GraphTheme } from "../types/public";

export interface PaintCache {
	nodeFontSize: number;
	edgeFontSize: number;
	fontFamily: string;
	zoomGrowthCap: number;
	getLabelScale: (globalScale: number) => number;
	getNodeFont: (globalScale: number) => string;
	getEdgeFont: (globalScale: number) => string;
	nodeColor: string;
	nodeHoverColor: string;
	labelColor: string;
	edgeLabelBg: string;
	dimRgb: string;
	defaultLinkAlpha: number;
	highlightOpacityBoost: number;
	hiddenLabelOpacity: number;
	dimOpacity: number;
	labelShiftY: number;
	opacityMinZoom: number;
	opacityMaxZoom: number;
	opacityRange: number;
	radius: number;
	labelGap: number;
	edgePaddingX: number;
	edgePaddingY: number;
	defaultLinkWidth: number;
	highlightedLinkWidth: number;
}

export function createPaintCache(theme: GraphTheme): PaintCache {
	const nodeFontSize = theme.node.fontSize;
	const edgeFontSize = theme.edge.fontSize;
	const fontFamily = theme.fontFamily;
	const zoomGrowthCap = theme.label.zoomGrowthCap;

	const nodeFontStringCache = new Map<number, string>();
	const edgeFontStringCache = new Map<number, string>();

	const getLabelScale = (globalScale: number): number =>
		globalScale > zoomGrowthCap ? globalScale / zoomGrowthCap : 1;

	const buildFont = (size: number, cache: Map<number, string>): string => {
		const key = Math.round(size * 10);
		const cached = cache.get(key);
		if (cached) return cached;
		const str = `${(key / 10).toFixed(1)}px ${fontFamily}`;
		cache.set(key, str);
		return str;
	};

	return {
		nodeFontSize,
		edgeFontSize,
		fontFamily,
		zoomGrowthCap,
		getLabelScale,
		getNodeFont: (globalScale: number) =>
			buildFont(nodeFontSize / getLabelScale(globalScale), nodeFontStringCache),
		getEdgeFont: (globalScale: number) =>
			buildFont(edgeFontSize / getLabelScale(globalScale), edgeFontStringCache),
		nodeColor: theme.node.color,
		nodeHoverColor: theme.node.hoverColor,
		labelColor: theme.node.labelColor,
		edgeLabelBg: theme.edge.labelBackgroundColor,
		dimRgb: theme.link.dimRgbTuple,
		defaultLinkAlpha: theme.link.defaultAlpha,
		highlightOpacityBoost: theme.hover.highlightOpacityBoost,
		hiddenLabelOpacity: theme.hover.hiddenLabelOpacity,
		dimOpacity: theme.hover.dimOpacity,
		labelShiftY: theme.hover.labelShiftY,
		opacityMinZoom: theme.label.opacityMinZoom,
		opacityMaxZoom: theme.label.opacityMaxZoom,
		opacityRange: theme.label.opacityMaxZoom - theme.label.opacityMinZoom,
		radius: theme.node.radius,
		labelGap: theme.node.labelGap,
		edgePaddingX: theme.edge.labelPaddingX,
		edgePaddingY: theme.edge.labelPaddingY,
		defaultLinkWidth: theme.link.defaultWidth,
		highlightedLinkWidth: theme.link.highlightedWidth,
	};
}
