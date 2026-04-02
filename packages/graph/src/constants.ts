export const FORCE_CONFIG = {
	linkDistance: 100,
	chargeStrength: -2000,
	centeringStrength: 0.06,
	cooldownTicks: 50, // how long simulation runs to settle layout
	alphaDecay: 0.025, // friction
	alphaMin: 0.001,
	alphaTarget: 0.3,
	velocityDecay: 0.45, // how quickly the nodes lose velocity (45% per tick)
};

export const GRAPH_CONFIG = {
	radius: 12,
	zoom_threshold: 1.5,
	dim_opacity: 0.15,
};
