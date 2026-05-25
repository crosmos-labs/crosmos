import { BlogSection } from "@/components/blog-section";
import { Contact } from "@/components/contact";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Mtkg } from "@/components/mtkg";
import { Pricing } from "@/components/pricing";
import { Problem } from "@/components/problem";
import { BlockTransition } from "@/components/ui/block-transition";

export default function Home() {
	return (
		<>
			<Hero />
			<Problem />
			<Features />
			<Mtkg />
			<HowItWorks />
			<Pricing />
			<BlogSection />
			<Faq />
			<BlockTransition
				fromColor="bg-background"
				toColor="bg-[oklch(0.19_0_0)]"
				rows={8}
			/>
			<Contact />
		</>
	);
}
