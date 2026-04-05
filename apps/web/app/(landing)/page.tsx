import { Example } from "@/components/example";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";

export default function Home() {
	return (
		<>
			<Hero />
			{/*<div
				className="relative w-full h-[450px] bg-cover bg-center my-16"
				style={{ backgroundImage: "url('/ocean.png')" }}
			>
				<div className="relative flex size-full items-center justify-center"></div>
			</div>*/}
			{/*<video src="/dither-grid.webm" autoPlay loop />*/}
			<Features />
			<Example />
			<Pricing />
		</>
	);
}
