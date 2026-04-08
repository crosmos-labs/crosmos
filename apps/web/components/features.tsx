import Image from "next/image";

export function Features() {
	return (
		<section id="features" className="relative py-16 px-6">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold mb-20 text-center">
					Core Features
				</h2>

				<div className="grid grid-cols-3 grid-rows-2 gap-3">
					<div className="relative row-span-2 col-span-1 pt-0 group aspect-5/8">
						<Image
							src="/greek.png"
							alt="Greek statue representing AI reasoning"
							fill
							sizes="(max-width: 768px) 100vw, 33vw"
							className="object-contain object-top grayscale group-hover:grayscale-0 transition-all"
						/>
						<div className="relative p-6 w-full flex justify-between items-center text-accent-foreground">
							<p className="font-mono font-semibold text-lg uppercase">
								Reasoning
							</p>
							<div className="h-1 w-18 bg-accent-foreground" />
						</div>
					</div>
					<div className="relative row-span-2 col-span-1 pt-0 group aspect-5/8">
						<Image
							src="/compass.png"
							alt="Compass representing temporal knowledge tracking"
							fill
							sizes="(max-width: 768px) 100vw, 33vw"
							className="object-contain object-top grayscale group-hover:grayscale-0 transition-all"
						/>
						<div className="relative p-6 w-full flex justify-between items-center text-accent-foreground">
							<p className="font-mono font-semibold text-lg uppercase">
								Temporal
							</p>
							<div className="h-1 w-18 bg-accent-foreground" />
						</div>
					</div>
					<div className="relative row-span-2 col-span-1 pt-0 group aspect-5/8">
						<Image
							src="/falcon.png"
							alt="Falcon representing speed and accuracy"
							fill
							sizes="(max-width: 768px) 100vw, 33vw"
							className="object-contain object-top grayscale group-hover:grayscale-0 transition-all"
						/>
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
