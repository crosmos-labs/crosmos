export const GRAPH_CONFIG = {
	zoom: {
		sensitivity: 0.5,
	},
	force: {
		linkDistance: 120,
		chargeStrength: -200,
		alphaDecay: 0.025,
		velocityDecay: 0.45,
	},
	node: {
		radius: 4,
		fontSize: 8,
		labelGap: 3,
		labelColor: "oklch(0.95 0 0)",
		color: "#ffffff",
	},
	link: {
		color: "rgba(148,163,184,0.4)",
		defaultAlpha: 0.4,
		defaultWidth: 0.5,
		highlightedWidth: 1.5,
	},
	edge: {
		fontSize: 6,
		labelPaddingX: 3,
		labelPaddingY: 1,
		labelBackgroundColor: "transparent",
	},
	label: {
		opacityMinZoom: 1.0,
		opacityMaxZoom: 1.5,
	},
	hover: {
		accentColor: "oklch(0.5544 0.1146 158.24)",
		labelShiftY: 2,
		hiddenLabelOpacity: 1,
		animationDurationMs: 150,
		highlightOpacityBoost: 0.6,
		dimOpacity: 0.15,
	},
	click: {
		centerAnimationDuration: 1000,
		targetZoom: 2,
	},
	edgeClick: {
		animationDuration: 1000,
		targetZoom: 2,
		padding: 80,
	},
} as const;
