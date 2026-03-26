import Image from "next/image";
import { Example } from "@/components/example";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
	return (
		<main className="bg-background text-foreground">
			<Navbar />
			<Hero />
			{/*<Benchmarks />*/}
			<Image
				src="/ocean.png"
				alt="ocean dither"
				width={1350}
				height={450}
				className="size-full"
			/>
			<Features />
			<Example />
			<Footer />
		</main>
	);
}
