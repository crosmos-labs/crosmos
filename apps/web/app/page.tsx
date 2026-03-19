import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
	return (
		<main className="bg-background text-foreground">
			<Navbar />
			<Hero />
		</main>
	);
}
