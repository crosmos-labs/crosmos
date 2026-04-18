import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import "./style.css";

export default function LandingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<main id="main-content" className="flex flex-col">
				<Navbar />
				{children}
			</main>
			<Footer />
		</>
	);
}
