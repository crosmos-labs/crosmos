export const isPlaygroundDisabled =
	process.env.NEXT_PUBLIC_PLAYGROUND_DISABLED === "true";

export const isSettingsDisabled =
	process.env.NEXT_PUBLIC_SETTINGS_DISABLED === "true";

export const isVisibilityDisabled =
	process.env.NEXT_PUBLIC_VISIBILITY_DISABLED === "true";

export function disabledFeatureResult(feature: string) {
	return {
		ok: false as const,
		status: 404,
		code: "feature_disabled",
		message: `${feature} is currently unavailable.`,
	};
}

export function assertFeatureEnabled(disabled: boolean, feature: string) {
	if (disabled) {
		throw new Error(`${feature} is currently unavailable.`);
	}
}
