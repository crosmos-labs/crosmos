"use client";

export function Features() {
	return (
		<section id="features" className="relative py-16 px-6">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">
					Core Features
				</h2>

				<div className="grid grid-cols-3 grid-rows-2 gap-3">
					<div className="relative row-span-2 col-span-1 pt-0 group aspect-5/8">
						<div className="absolute inset-0 size-full bg-[url('/greek.png')] bg-contain bg-no-repeat grayscale-100 group-hover:grayscale-0" />
						<div className="relative p-6 w-full flex justify-between items-center text-accent-foreground">
							<p className="font-mono font-semibold text-lg uppercase">
								Reasoning
							</p>
							<div className="h-1 w-18 bg-accent-foreground" />
						</div>
					</div>
					<div className="relative row-span-2 col-span-1 pt-0 group aspect-5/8">
						<div className="absolute inset-0 size-full bg-[url('/compass.png')] bg-contain bg-no-repeat grayscale-100 group-hover:grayscale-0" />
						<div className="relative p-6 w-full flex justify-between items-center text-accent-foreground">
							<p className="font-mono font-semibold text-lg uppercase">
								Temporal
							</p>
							<div className="h-1 w-18 bg-accent-foreground" />
						</div>
					</div>
					<div className="relative row-span-2 col-span-1 pt-0 group aspect-5/8">
						<div className="absolute inset-0 size-full bg-[url('/falcon.png')] bg-contain bg-no-repeat grayscale-100 group-hover:grayscale-0" />
						<div className="relative p-6 w-full flex justify-between items-center text-accent-foreground">
							<p className="font-mono font-semibold text-lg uppercase">
								Accuracy * Speed
							</p>
							<div className="h-1 w-18 bg-accent-foreground" />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
