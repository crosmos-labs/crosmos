import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { HeroBg } from "@/components/hero-bg";
import { Pricing } from "@/components/pricing";

export default function Home() {
	return (
		<>
			<HeroBg />
			<Features />
			<Pricing />
			<Faq />
		</>
	);
}
