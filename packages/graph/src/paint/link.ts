import type { PaintCache } from "./cache";
import type { PaintHoverState, RFGLink, RFGNode } from "./types";

const RGBA_CACHE = new Map<string, string>();

function rgba(rgb: string, alpha: number): string {
	const quantized = Math.round(alpha * 1000);
	const key = `${rgb}|${quantized}`;
	const cached = RGBA_CACHE.get(key);
	if (cached) return cached;
	const str = `rgba(${rgb},${(quantized / 1000).toFixed(3)})`;
	RGBA_CACHE.set(key, str);
	return str;
}

function isEdgeHighlighted(edgeId: string, hover: PaintHoverState): boolean {
	return hover.connectedEdges.has(edgeId) || edgeId === hover.hoveredEdgeId;
}

interface LinkEndpoints {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

function resolveEndpoints(link: RFGLink): LinkEndpoints | null {
	const src = link.source;
	const tgt = link.target;
	if (typeof src !== "object" || typeof tgt !== "object") return null;
	const srcNode = src as RFGNode;
	const tgtNode = tgt as RFGNode;
	return {
		x1: srcNode.x ?? 0,
		y1: srcNode.y ?? 0,
		x2: tgtNode.x ?? 0,
		y2: tgtNode.y ?? 0,
	};
}

function computeLabelAnchor(
	link: RFGLink,
	ends: LinkEndpoints,
): { x: number; y: number } | null {
	const midX = (ends.x1 + ends.x2) / 2;
	const midY = (ends.y1 + ends.y2) / 2;
	if (link.curvature === 0) return { x: midX, y: midY };

	const dx = ends.x2 - ends.x1;
	const dy = ends.y2 - ends.y1;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return { x: midX, y: midY };

	const perpX = -dy / dist;
	const perpY = dx / dist;
	const offset = 0.5 * link.curvature * dist;
	return { x: midX + perpX * offset, y: midY + perpY * offset };
}

export interface EdgeLabelBox {
	x: number;
	y: number;
	w: number;
	h: number;
	anchorX: number;
	anchorY: number;
}

function measureLabelBox(
	link: RFGLink,
	ctx: CanvasRenderingContext2D,
	cache: PaintCache,
	globalScale: number,
): EdgeLabelBox | null {
	if (!link.label) return null;
	const ends = resolveEndpoints(link);
	if (!ends) return null;
	const anchor = computeLabelAnchor(link, ends);
	if (!anchor) return null;
	const textWidth = ctx.measureText(link.label).width;
	const labelScale = cache.getLabelScale(globalScale);
	const paddingX = cache.edgePaddingX / labelScale;
	const paddingY = cache.edgePaddingY / labelScale;
	const fontHeight = cache.edgeFontSize / labelScale;
	const w = textWidth + paddingX * 2;
	const h = fontHeight + paddingY * 2;
	return {
		x: anchor.x - w / 2,
		y: anchor.y - h / 2,
		w,
		h,
		anchorX: anchor.x,
		anchorY: anchor.y,
	};
}

export function createLinkColor(
	cache: PaintCache,
	hover: PaintHoverState,
	hoverColor: string,
): (link: RFGLink) => string {
	return (link) => {
		const edgeId = link.edgeId;
		const p = hover.getNodeProgress();
		const isFadeOut =
			hover.hoveredNodeId === null && hover.lastHoveredNodeId !== null;
		if (isEdgeHighlighted(edgeId, hover) && !isFadeOut) {
			return hoverColor;
		}
		const dimmedAlpha =
			cache.defaultLinkAlpha * (1 - p * (1 - cache.dimOpacity));
		return rgba(cache.dimRgb, dimmedAlpha);
	};
}

export function createLinkWidth(
	cache: PaintCache,
	hover: PaintHoverState,
): (link: RFGLink) => number {
	return (link) =>
		isEdgeHighlighted(link.edgeId, hover)
			? cache.highlightedLinkWidth
			: cache.defaultLinkWidth;
}

export function createLinkPainter(
	cache: PaintCache,
	hover: PaintHoverState,
): (link: RFGLink, ctx: CanvasRenderingContext2D, globalScale: number) => void {
	return (link, ctx, globalScale) => {
		const label = link.label;
		if (!label) return;

		ctx.font = cache.getEdgeFont(globalScale);
		const box = measureLabelBox(link, ctx, cache, globalScale);
		if (!box) return;

		const labelOpacity = Math.min(
			1,
			Math.max(0, (globalScale - cache.opacityMinZoom) / cache.opacityRange),
		);

		const isDirectHovered = link.edgeId === hover.hoveredEdgeId;
		const isFadeOut =
			hover.hoveredNodeId === null && hover.lastHoveredNodeId !== null;
		const isConnectedHovered = isFadeOut
			? hover.prevConnectedEdges.has(link.edgeId)
			: hover.connectedEdges.has(link.edgeId);
		const isEdgeActive = isDirectHovered || isConnectedHovered;
		const p = hover.getNodeProgress();

		const dimFactor = isEdgeActive ? 1 : 1 - p * (1 - cache.dimOpacity);
		const ep = isDirectHovered ? hover.getEdgeProgress() : 0;

		const shouldShowLabel = labelOpacity > 0 || ep > 0;
		if (!shouldShowLabel && !isConnectedHovered) return;

		const baseOpacity = labelOpacity;
		const targetOpacity =
			baseOpacity <= 0
				? cache.hiddenLabelOpacity
				: Math.max(baseOpacity, cache.highlightOpacityBoost);
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
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.fillStyle = cache.edgeLabelBg;
		ctx.fillRect(box.x, box.y, box.w, box.h);

		ctx.fillStyle = cache.labelColor;
		ctx.fillText(label, box.anchorX, box.anchorY);
		ctx.globalAlpha = 1;
	};
}

// Setting `linkPointerAreaPaint` replaces the lib's default shadow link paint,
// so we have to draw both the line (mirroring the lib's default hit width) and
// the label rectangle to make the label part of the hit area.
export function createLinkPointerAreaPaint(
	cache: PaintCache,
	hitLineWidth: number,
): (
	link: RFGLink,
	color: string,
	ctx: CanvasRenderingContext2D,
	globalScale: number,
) => void {
	return (link, color, ctx, globalScale) => {
		const ends = resolveEndpoints(link);
		if (!ends) return;

		ctx.strokeStyle = color;
		ctx.lineWidth = hitLineWidth / globalScale + 2;
		ctx.beginPath();
		ctx.moveTo(ends.x1, ends.y1);

		if (link.curvature !== 0) {
			const dx = ends.x2 - ends.x1;
			const dy = ends.y2 - ends.y1;
			const l = Math.sqrt(dx * dx + dy * dy);
			if (l > 0) {
				const a = Math.atan2(dy, dx);
				const d = l * link.curvature;
				const cpx = (ends.x1 + ends.x2) / 2 + d * Math.cos(a - Math.PI / 2);
				const cpy = (ends.y1 + ends.y2) / 2 + d * Math.sin(a - Math.PI / 2);
				ctx.quadraticCurveTo(cpx, cpy, ends.x2, ends.y2);
			} else {
				const d = link.curvature * 70;
				ctx.bezierCurveTo(
					ends.x2,
					ends.y2 - d,
					ends.x2 + d,
					ends.y2,
					ends.x2,
					ends.y2,
				);
			}
		} else {
			ctx.lineTo(ends.x2, ends.y2);
		}
		ctx.stroke();

		if (link.label) {
			ctx.font = cache.getEdgeFont(globalScale);
			const box = measureLabelBox(link, ctx, cache, globalScale);
			if (box) {
				ctx.fillStyle = color;
				ctx.fillRect(box.x, box.y, box.w, box.h);
			}
		}
	};
}
