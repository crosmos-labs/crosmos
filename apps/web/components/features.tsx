import Image from "next/image";

const cards = [
	{
		src: "/greek.png",
		alt: "Greek statue representing AI reasoning",
		label: "Reasoning",
	},
	{
		src: "/compass.png",
		alt: "Compass representing temporal knowledge tracking",
		label: "Temporal",
	},
	{
		src: "/falcon.png",
		alt: "Falcon representing speed and accuracy",
		label: "Accuracy * Speed",
	},
];

export function Features() {
	return (
		<section
			id="features"
			className="relative px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24"
		>
			<div className="max-w-7xl mx-auto">
				<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-10 sm:mb-16 lg:mb-20 text-center">
					Core Features
				</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-3">
					{cards.map((card) => (
						<div key={card.label} className="relative pt-0 group aspect-5/8">
							<Image
								src={card.src}
								alt={card.alt}
								fill
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								className="object-contain object-top grayscale-0 sm:grayscale sm:group-hover:grayscale-0 transition-all"
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
