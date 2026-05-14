import Image from "next/image";

const cards = [
	{
		src: "/tkg.png",
		alt: "Monotonic Temporal Knowledge Graph illustration",
		label: "Monotonic Temporal Knowledge Graph",
	},
	{
		src: "/falcon.png",
		alt: "Hybrid Retrieval artwork",
		label: "Hybrid Retrieval",
	},
	{
		src: "/greek.png",
		alt: "Content-Agnostic Ingestion artwork",
		label: "Content-Agnostic Ingestion",
	},
	{
		src: "/enterprise.png",
		alt: "Enterprise-Grade illustration",
		label: "Enterprise-Grade",
	},
	{
		src: "/audit.png",
		alt: "Auditable artwork",
		label: "Auditable",
	},
	{
		src: "/multi-agent.png",
		alt: "Multi-Agent by Design artwork",
		label: "Multi-Agent by Design",
	},
];

export function Features() {
	return (
		<section
			id="features"
			className="relative px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<p className="text-accent font-mono uppercase text-center">
					{" "}
					[ Core Features ]
				</p>
				<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 sm:mb-16 lg:mb-20 text-center">
					Designed for Reliable Agent Context
				</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3">
					{cards.map((card) => (
						<div
							key={card.label}
							className="relative pt-0 group aspect-5/8 select-none"
						>
							<Image
								src={card.src}
								alt={card.alt}
								fill
								draggable={false}
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								className="object-cover grayscale-0 sm:grayscale sm:group-hover:grayscale-0 transition-all select-none"
							/>
							<div className="relative p-6 w-full flex justify-between items-center text-accent-foreground">
								<p className="font-mono font-semibold text-lg uppercase">
									{card.label}
								</p>
								<div className="h-1 w-18 bg-accent-foreground" />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
