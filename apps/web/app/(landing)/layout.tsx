import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function LandingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<main className="flex flex-col">
				<Navbar />
				{children}
			</main>
			<Footer />
		</>
	);
}
