import { BlogSection } from "@/components/blog-section";
import { Contact } from "@/components/contact";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { HeroBg } from "@/components/hero-bg";
import { Pricing } from "@/components/pricing";
import { BlockTransition } from "@/components/ui/block-transition";

export default function Home() {
	return (
		<>
			<HeroBg />
			<div className="relative z-10 -mt-[20vh] sm:-mt-[16vh] md:-mt-[24vh] lg:-mt-[28vh] min-h-[10vh]">
				<BlockTransition fromColor="bg-transparent" toColor="bg-background" />
			</div>
			<Features />
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
