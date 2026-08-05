import { DitherGradient } from "@crosmos/ui/components/dither-kit/gradient";
import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { LINKS } from "@/config/links";

export function ResearchBanner() {
	return (
		<section
			aria-labelledby="research-benchmarks-title"
			className="dark bg-background text-foreground"
		>
			<h2 id="research-benchmarks-title" className="sr-only">
				Research benchmarks
			</h2>
			<Link
				href={LINKS.company.research}
				className="link-underline-trigger relative block overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
			>
				<DitherGradient
					from="green"
					direction="left"
					cell={4}
					opacity={0.45}
					className="opacity-60"
				/>
				<div className="relative mx-auto max-w-7xl">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
						<div className="p-8 sm:p-10 lg:p-12">
							<p className="font-bold text-5xl tracking-tight tabular-nums sm:text-6xl lg:text-7xl">
								99.7%
							</p>
							<p className="mt-2 font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground">
								Recall@10
							</p>
						</div>
						<div className="p-8 sm:p-10 lg:p-12">
							<p className="font-bold text-5xl tracking-tight tabular-nums sm:text-6xl lg:text-7xl">
								91%
							</p>
							<p className="mt-2 font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground">
								LongMemEval-s accuracy
							</p>
						</div>
						<div className="flex items-center justify-between gap-6 p-8 sm:col-span-2 sm:p-10 lg:col-span-1 lg:min-w-72 lg:p-12">
							<span className="link-underline font-mono text-sm font-bold uppercase tracking-wide sm:text-base">
								Read the research
							</span>
							<IconArrowUpRight
								aria-hidden="true"
								className="size-5 shrink-0"
							/>
						</div>
					</div>
				</div>
			</Link>
		</section>
	);
}
