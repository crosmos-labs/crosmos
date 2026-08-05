import { Markdown } from "@/components/markdown";
import { proseMdxComponents } from "@/components/prose-mdx";
import { Toc } from "@/components/toc";
import { formatLegalDate, type LegalDoc } from "@/lib/legal";

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
							<Toc sections={doc.sections} />
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
								<Toc sections={doc.sections} />
							</div>
						</details>

						<div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-code:text-sm prose-a:text-foreground prose-a:underline prose-a:underline-offset-4">
							<Markdown source={doc.content} components={proseMdxComponents} />
						</div>

						<ContactBox docTitle={doc.title} />
					</div>
				</div>
			</div>
		</article>
	);
}
