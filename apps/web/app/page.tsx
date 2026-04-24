import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";

export default function Home() {
	return (
		<>
			<Hero />
			<Features />
			<Pricing />
			<Faq />
		</>
	);
}
