import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

/**
 * Single render path for all markdown/MDX content (blog, legal, research).
 * Components are per-caller. `gfm` is opt-in (tables/footnotes): only research
 * needs it — enabling it elsewhere would autolink bare emails/URLs and change
 * the legal/blog output, so it stays off by default.
 */
export function Markdown({
	source,
	components,
	gfm = false,
}: {
	source: string;
	components?: MDXRemoteProps["components"];
	gfm?: boolean;
}) {
	return (
		<MDXRemote
			source={source}
			components={components}
			options={gfm ? { mdxOptions: { remarkPlugins: [remarkGfm] } } : undefined}
		/>
	);
}
