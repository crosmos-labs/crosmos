import type { GraphTheme } from "../types/public";

export const DEFAULT_THEME: GraphTheme = {
	force: {
		linkDistance: 120,
		chargeStrength: -250,
		chargeDistanceMax: 500,
		alphaDecay: 0.015,
		velocityDecay: 0.6,
		boundaryStrength: 0.02,
	},
	node: {
		radius: 4,
		fontSize: 8,
		labelGap: 3,
		labelColor: "oklch(0.95 0 0)",
		color: "#ffffff",
		hoverColor: "oklch(0.5544 0.1146 158.24)",
	},
	link: {
		color: "rgba(148,163,184,0.4)",
		defaultAlpha: 0.4,
		defaultWidth: 0.5,
		highlightedWidth: 1.5,
		curvatureSpacing: 0.25,
		dimRgbTuple: "148,163,184",
	},
	edge: {
		fontSize: 6,
		labelPaddingX: 3,
		labelPaddingY: 1,
		labelBackgroundColor: "transparent",
	},
	label: {
		opacityMinZoom: 1.2,
		opacityMaxZoom: 1.7,
		zoomGrowthCap: 3,
	},
	hover: {
		labelShiftY: 2,
		hiddenLabelOpacity: 1,
		animationDurationMs: 150,
		highlightOpacityBoost: 0.6,
		dimOpacity: 0.15,
	},
	click: {
		centerAnimationDuration: 300,
		targetZoom: 2,
	},
	edgeClick: {
		animationDuration: 300,
		targetZoom: 2,
		padding: 80,
	},
	cluster: {
		intraLinkDistance: 120,
		interLinkDistance: 280,
		strength: 0.14,
	},
	fontFamily: "Satoshi, Inter, ui-sans-serif, system-ui, sans-serif",
};

type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function cloneDefaultTheme(): GraphTheme {
	const src = DEFAULT_THEME as unknown as Record<string, unknown>;
	const out: Record<string, unknown> = {};
	for (const k of Object.keys(src)) {
		const v = src[k];
		out[k] = v && typeof v === "object" ? { ...(v as object) } : v;
	}
	return out as unknown as GraphTheme;
}

export function mergeTheme(
	override: DeepPartial<GraphTheme> | undefined,
): GraphTheme {
	const out = cloneDefaultTheme();
	if (!override) return out;
	for (const k of Object.keys(override) as Array<keyof GraphTheme>) {
		const baseVal = out[k];
		const overVal = override[k];
		if (
			baseVal &&
			overVal &&
			typeof baseVal === "object" &&
			typeof overVal === "object"
		) {
			(out as unknown as Record<string, unknown>)[k] = {
				...(baseVal as object),
				...(overVal as object),
			};
		} else if (overVal !== undefined) {
			(out as unknown as Record<string, unknown>)[k] = overVal;
		}
	}
	return out;
}
