import Image from "next/image";

type Transformation = {
	before: string;
	after: string;
	description: string;
};

const TRANSFORMATIONS: Transformation[] = [
	{
		before: "Scattered context",
		after: "Unified memory",
		description:
			"Context across Slack, docs, and tickets becomes a single queryable layer.",
	},
	{
		before: "Stateless sessions",
		after: "Persistent context",
		description:
			"Every interaction builds on the last. No more starting from zero.",
	},
	{
		before: "Guesswork",
		after: "Structured facts",
		description:
			"Agents get precise facts, not document chunks to parse through.",
	},
	{
		before: "Knowledge decay",
		after: "Compounding intelligence",
		description:
			"Organizational knowledge strengthens over time instead of degrading.",
	},
];

export function Problem() {
	return (
		<section
			id="problem"
			className="relative px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
					{/* Content column — 60% on lg+ */}
					<div className="lg:col-span-3">
						<p className="text-accent font-mono font-bold uppercase mb-4">
							[ The Problem ]
						</p>
						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
							Scattered context. Stateless agents.
						</h2>
						<p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
							Context lives in Slack, docs, tickets, and meetings. Agents see
							fragments, not the picture. Crosmos builds structured
							organizational memory — queryable, persistent, and self-improving.
						</p>

						<div className="mt-10 sm:mt-12">
							{TRANSFORMATIONS.map((t, i) => (
								<div
									key={t.before}
									className={
										i === 0 ? "py-5" : "py-5 border-t border-foreground/10"
									}
								>
									<div className="flex flex-wrap items-baseline gap-x-3 text-base sm:text-lg">
										<span className="text-muted-foreground line-through decoration-foreground/30">
											{t.before}
										</span>
										<span className="text-foreground/40" aria-hidden="true">
											→
										</span>
										<span className="text-foreground font-semibold">
											{t.after}
										</span>
									</div>
									<p className="mt-2 text-sm text-muted-foreground leading-relaxed">
										{t.description}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Asset column — 40% on lg+ */}
					<div className="lg:col-span-2">
						<div className="relative aspect-3/5 w-full overflow-hidden rounded">
							<Image
								src="/current.avif"
								alt="A winding river — fragmented streams converging into a single flow"
								fill
								sizes="(min-width: 1024px) 40vw, 100vw"
								className="object-cover object-center"
								priority={false}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
