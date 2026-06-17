export function SkipToContent() {
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-semibold"
		>
			Skip to content
		</a>
	);
}
