import { Button } from "@crosmos/ui/components/button";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen max-w-7xl flex-1 flex flex-col items-center justify-center mx-auto">
			<div className="flex flex-col justify-center py-20 border-border gap-6">
				<p className="font-mono text-4xl text-accent text-end"> [ 404 ]</p>
				<h1 className="font-medium text-8xl">
					Page <span className="text-foreground/70">/not found</span>
				</h1>
				<div className="flex justify-between items-center">
					<p className="text-xl text-foreground/90">
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
