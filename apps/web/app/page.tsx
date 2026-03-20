import { Benchmarks } from "@/components/benchmarks";
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
			<Benchmarks />
			<Features />
			<Example />
			<Footer />
		</main>
	);
}
