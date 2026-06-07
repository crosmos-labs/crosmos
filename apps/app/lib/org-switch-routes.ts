const ORG_SWITCH_FALLBACKS = [
	{ pattern: /^\/spaces\/[^/]+$/, fallback: "/spaces" },
] as const;

export function getOrgSwitchFallbackPath(pathname: string): string | null {
	return (
		ORG_SWITCH_FALLBACKS.find((route) => route.pattern.test(pathname))
			?.fallback ?? null
	);
}
