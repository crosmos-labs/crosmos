import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";

export default function Home() {
	return (
		<main className="bg-background text-foreground">
			<Navbar />
			<Hero />
			<div
				className="relative w-full h-[450px] bg-cover bg-center my-16"
				style={{ backgroundImage: "url('/ocean.png')" }}
			>
				<div className="relative flex size-full items-center justify-center"></div>
			</div>
			<Features />
			<Pricing />
			<Footer />
		</main>
	);
}
