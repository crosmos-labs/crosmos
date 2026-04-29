import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { HeroSection } from "@/components/hero-section";
import { Pricing } from "@/components/pricing";

export default function Home() {
	return (
		<>
			<HeroSection />
			<Features />
			<Pricing />
			<Faq />
		</>
	);
}
