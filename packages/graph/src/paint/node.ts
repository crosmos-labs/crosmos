import type { PaintCache } from "./cache";
import type { PaintHoverState, RFGNode } from "./types";

export function createNodePainter(
	cache: PaintCache,
	hover: PaintHoverState,
): (node: RFGNode, ctx: CanvasRenderingContext2D, globalScale: number) => void {
	return (node, ctx, globalScale) => {
		const nodeId = node.id;
		const label = node.label;
		const isHovered = hover.hoveredNodeId === nodeId;
		const isFadingOut =
			hover.hoveredNodeId === null && hover.lastHoveredNodeId !== null;
		const wasHovered = hover.lastHoveredNodeId === nodeId;
		const isConnected = isFadingOut
			? hover.prevConnectedNodeIds.has(nodeId)
			: hover.connectedNodeIds.has(nodeId);
		const p = hover.getNodeProgress();

		const isHighlighted = isHovered || isConnected || wasHovered;
		const dimFactor = isHighlighted ? 1 : 1 - p * (1 - cache.dimOpacity);

		const labelOpacity = Math.min(
			1,
			Math.max(0, (globalScale - cache.opacityMinZoom) / cache.opacityRange),
		);

		const fillColor =
			isHovered || (isFadingOut && wasHovered)
				? cache.nodeHoverColor
				: cache.nodeColor;

		const hoverLabelProgress = isHovered || (isFadingOut && wasHovered) ? p : 0;
		const shouldShowLabel = labelOpacity > 0 || hoverLabelProgress > 0;

		const x = node.x ?? 0;
		const y = node.y ?? 0;

		if (!shouldShowLabel) {
			ctx.globalAlpha = dimFactor;
			ctx.beginPath();
			ctx.arc(x, y, cache.radius, 0, 2 * Math.PI);
			ctx.fillStyle = fillColor;
			ctx.fill();
			ctx.globalAlpha = 1;
			return;
		}

		const targetOpacity =
			labelOpacity <= 0
				? cache.hiddenLabelOpacity
				: Math.max(labelOpacity, cache.highlightOpacityBoost);
		const effectiveOpacity =
			labelOpacity + hoverLabelProgress * (targetOpacity - labelOpacity);

		const labelScale = cache.getLabelScale(globalScale);
		const labelGap = cache.labelGap / labelScale;
		const labelYOffset = (hoverLabelProgress * cache.labelShiftY) / labelScale;

		ctx.font = cache.getNodeFont(globalScale);
		ctx.textAlign = "center";
		ctx.textBaseline = "top";

		ctx.globalAlpha = dimFactor;
		ctx.beginPath();
		ctx.arc(x, y, cache.radius, 0, 2 * Math.PI);
		ctx.fillStyle = fillColor;
		ctx.fill();

		ctx.globalAlpha = isHighlighted
			? effectiveOpacity
			: effectiveOpacity * dimFactor;
		ctx.fillStyle = cache.labelColor;
		ctx.fillText(label, x, y + cache.radius + labelGap + labelYOffset);
		ctx.globalAlpha = 1;
	};
}
