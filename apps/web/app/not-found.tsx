import { Button } from "@crosmos/ui/components/button";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-dvh max-w-7xl flex-1 flex flex-col items-center justify-center mx-auto px-6 sm:px-6 lg:px-8">
			<div className="flex flex-col justify-center py-12 sm:py-16 md:py-20 border-border gap-6">
				<p className="font-mono text-2xl sm:text-3xl md:text-4xl text-accent text-end">
					{" "}
					[ 404 ]
				</p>
				<h1 className="font-medium text-4xl sm:text-5xl md:text-6xl lg:text-8xl">
					Page <span className="text-foreground/70">/not found</span>
				</h1>
				<div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center">
					<p className="text-base sm:text-lg md:text-xl text-foreground/90">
						The page may have been removed or try again later...
					</p>
					<Button
						size="lg"
						className="hover:bg-accent/90 px-6 py-3 rounded font-semibold transition-colors text-sm"
					>
						<Link href="/">Go Home</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
