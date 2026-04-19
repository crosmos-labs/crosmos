import { Example } from "@/components/example";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";

export default function Home() {
	return (
		<>
			<Hero />
			<Features />
			<Example />
			<Pricing />
		</>
	);
}
