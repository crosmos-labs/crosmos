import { IconLink } from "@tabler/icons-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Children, type ComponentProps, type ReactNode } from "react";
import { LegalToc } from "@/components/legal-toc";
import { formatLegalDate, type LegalDoc, slugifyHeading } from "@/lib/legal";

function childrenToText(children: ReactNode): string {
	let out = "";
	Children.forEach(children, (child) => {
		if (typeof child === "string" || typeof child === "number") {
			out += String(child);
		} else if (
			child &&
			typeof child === "object" &&
			"props" in child &&
			(child as { props?: { children?: ReactNode } }).props?.children
		) {
			out += childrenToText(
				(child as { props: { children: ReactNode } }).props.children,
			);
		}
	});
	return out;
}

function wrapQuotedText(children: ReactNode): ReactNode {
	return Children.map(children, (child, idx) => {
		if (typeof child !== "string") return child;
		const parts = child.split(/("[^"\n]+")/g);
		if (parts.length === 1) return child;
		return parts.map((part, i) => {
			const key = `${idx}-${i}`;
			if (part.length > 2 && part.startsWith('"') && part.endsWith('"')) {
				return (
					<span key={key} className="font-medium text-foreground">
						{part}
					</span>
				);
			}
			return <span key={key}>{part}</span>;
		});
	});
}

function AnchorHeading({
	tag: Tag,
	children,
	...rest
}: ComponentProps<"h2"> & { tag: "h2" | "h3" }) {
	const text = childrenToText(children);
	const id = slugifyHeading(text);
	return (
		<Tag id={id} className="group/heading scroll-mt-24" {...rest}>
			<a
				href={`#${id}`}
				aria-label={`Link to section: ${text}`}
				className="no-underline opacity-0 group-hover/heading:opacity-100 transition-opacity mr-2 inline-flex align-middle text-muted-foreground hover:text-foreground"
			>
				<IconLink className="size-4 inline-block -mt-0.5" />
			</a>
			{children}
		</Tag>
	);
}

const mdxComponents = {
	h2: (props: ComponentProps<"h2">) => <AnchorHeading tag="h2" {...props} />,
	h3: (props: ComponentProps<"h3">) => <AnchorHeading tag="h3" {...props} />,
	p: ({ children, ...rest }: ComponentProps<"p">) => (
		<p {...rest}>{wrapQuotedText(children)}</p>
	),
	li: ({ children, ...rest }: ComponentProps<"li">) => (
		<li {...rest}>{wrapQuotedText(children)}</li>
	),
};

function ContactBox({ docTitle }: { docTitle: string }) {
	return (
		<div className="not-prose mt-16 rounded-lg border border-border bg-card p-6">
			<h2 className="text-lg font-semibold mb-2">Questions?</h2>
			<p className="text-sm text-muted-foreground leading-relaxed">
				For any question or request relating to this {docTitle}, email{" "}
				<a
					href="mailto:support@crosmos.dev"
					className="text-foreground underline underline-offset-4 hover:opacity-80"
				>
					support@crosmos.dev
				</a>
				.
			</p>
		</div>
	);
}

export function LegalLayout({ doc }: { doc: LegalDoc }) {
	const effective = formatLegalDate(doc.effectiveAt);
	const updated = formatLegalDate(doc.updatedAt);
	const showBothDates = doc.effectiveAt !== doc.updatedAt;

	return (
		<article className="min-h-screen px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
			<div className="mx-auto w-full max-w-6xl">
				<div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
					<aside className="hidden lg:block">
						<div className="sticky top-24">
							<LegalToc sections={doc.sections} />
						</div>
					</aside>

					<div className="min-w-0 max-w-3xl">
						<header className="mb-12">
							<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
								{doc.title}
							</h1>
							<p className="mt-3 text-sm text-muted-foreground">
								{showBothDates ? (
									<>
										Effective {effective} &middot; Last updated {updated}
									</>
								) : (
									<>Last updated {updated}</>
								)}
							</p>
						</header>

						<details className="lg:hidden mb-10 rounded-lg border border-border bg-card">
							<summary className="cursor-pointer px-4 py-3 text-sm font-medium select-none">
								On this page
							</summary>
							<div className="px-4 pb-4">
								<LegalToc sections={doc.sections} />
							</div>
						</details>

						<div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-code:text-sm prose-a:text-foreground prose-a:underline prose-a:underline-offset-4">
							<MDXRemote source={doc.content} components={mdxComponents} />
						</div>

						<ContactBox docTitle={doc.title} />
					</div>
				</div>
			</div>
		</article>
	);
}
