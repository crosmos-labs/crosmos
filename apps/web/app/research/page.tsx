import type { Metadata } from "next";
import { Children, type ComponentProps, type ReactNode } from "react";
import { Markdown } from "@/components/markdown";
import {
	childrenToText,
	linkifyText,
	proseMdxComponents,
} from "@/components/prose-mdx";
import { Toc } from "@/components/toc";
import { getResearchDoc } from "@/lib/research";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const doc = getResearchDoc();

export const metadata: Metadata = {
	title: { absolute: `${doc.title} — Research` },
	description: doc.epigraph,
	alternates: { canonical: "/research" },
	openGraph: {
		type: "article",
		url: "/research",
		title: doc.title,
		description: doc.epigraph,
		images: [OG_IMAGE],
	},
	twitter: {
		card: "summary_large_image",
		title: doc.title,
		description: doc.epigraph,
		images: [OG_IMAGE.url],
	},
};

function firstCellText(children: ReactNode): string {
	const first = Children.toArray(children)[0];
	if (first && typeof first === "object" && "props" in first) {
		return childrenToText(
			(first as { props?: { children?: ReactNode } }).props?.children,
		).trim();
	}
	return "";
}

const researchMdxComponents = {
	...proseMdxComponents,
	table: ({ children, ...rest }: ComponentProps<"table">) => (
		<div className="not-prose research-table-wrap">
			<table className="research-table" {...rest}>
				{children}
			</table>
		</div>
	),
	tr: ({ children, ...rest }: ComponentProps<"tr">) => {
		const cell = firstCellText(children);
		const highlight = /^overall$/i.test(cell) || /crosmos/i.test(cell);
		return (
			<tr
				className={
					highlight ? "bg-primary/8 font-medium text-foreground" : undefined
				}
				{...rest}
			>
				{children}
			</tr>
		);
	},
};

const researchJsonLd = {
	"@context": "https://schema.org",
	"@type": "ScholarlyArticle",
	headline: doc.title,
	description: doc.epigraph,
	url: `${SITE_URL}/research`,
	author: { "@type": "Organization", name: "Crosmos Labs", url: SITE_URL },
	publisher: {
		"@type": "Organization",
		name: "Crosmos Labs",
		url: SITE_URL,
		logo: { "@type": "ImageObject", url: `${SITE_URL}/opengraph-image.png` },
	},
	mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/research` },
	isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export default function ResearchPage() {
	return (
		<article className="min-h-screen px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD
				dangerouslySetInnerHTML={{ __html: JSON.stringify(researchJsonLd) }}
			/>
			<div className="mx-auto w-full max-w-6xl">
				<header className="mb-14 max-w-3xl lg:mb-16">
					<p className="text-primary font-mono font-bold uppercase mb-4">
						[ Research ]
					</p>
					<h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
						{doc.title}
					</h1>
					{doc.epigraph && (
						<p className="mt-6 border-l-2 border-primary pl-5 text-lg leading-relaxed text-foreground/90 sm:text-xl">
							{doc.epigraph}
						</p>
					)}
				</header>

				<div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
					<aside className="hidden lg:block">
						<div className="sticky top-24">
							<Toc sections={doc.sections} />
						</div>
					</aside>

					<div className="min-w-0 max-w-3xl">
						<details className="mb-10 rounded-lg border border-border bg-card lg:hidden">
							<summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium">
								On this page
							</summary>
							<div className="px-4 pb-4">
								<Toc sections={doc.sections} />
							</div>
						</details>

						<div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-code:text-sm prose-a:text-foreground prose-a:underline prose-a:underline-offset-4">
							<Markdown source={doc.body} components={researchMdxComponents} gfm />
							{doc.uncitedRefs.length > 0 && (
								<section className="footnotes research-uncited">
									<ol start={doc.citedCount + 1}>
										{doc.uncitedRefs.map((ref) => (
											<li key={ref.id}>
												<p>{linkifyText(ref.text)}</p>
											</li>
										))}
									</ol>
								</section>
							)}
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}
