"use client";

import { Card, CardContent } from "@crosmos/ui/components/card";

export function Features() {
	const features = [
		{
			title: "Semantic Search",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
			image:
				"https://images.unsplash.com/photo-1516321318423-f06f70504504?w=500&h=500&fit=crop",
		},
		{
			title: "Code Intelligence",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
			image:
				"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop",
		},
		{
			title: "Fast Processing",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
			image:
				"https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop",
		},
		{
			title: "Infinite Scale",
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
			image:
				"https://images.unsplash.com/photo-1526374965328-7f5ae4e8e49e?w=500&h=500&fit=crop",
		},
	];

	return (
		<section id="features" className="relative py-24 px-6">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">
					Core Features
				</h2>

				<div className="space-y-20">
					{features.map((feature, i) => (
						<div
							key={i}
							className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch ${
								i % 2 === 1 ? "md:grid-cols-[1fr_1fr] md:auto-cols-fr" : ""
							}`}
						>
							{/* Image - Left or Right */}
							<div
								className={`order-1 ${i % 2 === 1 ? "md:order-2" : "md:order-1"}`}
							>
								<Card className="h-full overflow-hidden">
									<CardContent className="p-0 h-full">
										<img
											src={feature.image}
											alt={feature.title}
											className="w-full h-full object-cover aspect-square"
										/>
									</CardContent>
								</Card>
							</div>

							{/* Content - Right or Left */}
							<div
								className={`order-2 flex flex-col justify-start ${
									i % 2 === 1 ? "md:order-1" : "md:order-2"
								}`}
							>
								<div className="space-y-4">
									<h3 className="text-3xl font-bold text-foreground">
										{feature.title}
									</h3>
									<p className="text-lg text-foreground/70 leading-relaxed">
										{feature.description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
