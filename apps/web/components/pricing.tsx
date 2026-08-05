"use client";

import { Button } from "@crosmos/ui/components/button";
import { cn } from "@crosmos/ui/lib/utils";
import { IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { LINKS } from "@/config/links";
import { useCalApi } from "@/hooks/use-cal-api";
import { CornerPlus } from "./ui/corner-plus";

type PLAN = {
	id: string;
	title: string;
	desc: string;
	monthlyPrice: number;
	buttonText: string;
	features: string[];
	link?: string;
};

export const PLANS: PLAN[] = [
	{
		id: "basic",
		title: "Basic",
		desc: "Perfect for people to get started with having a mini memory in your apps",
		monthlyPrice: 0,
		buttonText: "Start free",
		features: [
			"500K tokens/month",
			"5K queries/month",
			"Unlimited memory spaces",
			"MCP server integration",
			"Community email support",
		],
		link: LINKS.product.console,
	},
	{
		id: "developer",
		title: "Developer",
		desc: "For growing teams that need more power and flexibility.",
		monthlyPrice: 19,
		buttonText: "Create account",
		features: [
			"3M tokens/month",
			"30K queries/month",
			"Unlimited memory spaces",
			"MCP server integration",
			"Pre-built data connectors",
			"Priority email support",
		],
		link: LINKS.product.console,
	},
	{
		id: "pro",
		title: "Pro",
		desc: "For production teams that need higher limits, advanced observability, and dedicated support.",
		monthlyPrice: 299,
		buttonText: "Create account",
		features: [
			"40M tokens/month",
			"200K queries/month",
			"Unlimited memory spaces",
			"MCP server integration",
			"Pre-built data connectors",
			"Dedicated support channel",
			"Full observability & tracing",
		],
		link: LINKS.product.console,
	},
	{
		id: "enterprise",
		title: "Enterprise",
		desc: "For large organizations requiring advanced security and control.",
		monthlyPrice: -1,
		buttonText: "Contact Sales",
		features: [
			"Unlimited tokens",
			"Unlimited search queries",
			"Unlimited memory spaces",
			"Self-hosted deployment option",
		],
	},
];

const PlanCard = ({ plan }: { plan: PLAN }) => {
	const initCal = useCalApi("30min");

	return (
		<div
			className={cn(
				"flex flex-col relative bg-background items-start w-full border-foreground/10 border-2 hover:bg-card/60 transition-colors hover:transition-none duration-300",
				plan.id === "developer" && "lg:border-x-0",
				plan.id === "enterprise" && "lg:col-span-3 overflow-hidden border-t-0",
			)}
		>
			{plan.id === "developer" && (
				<>
					<CornerPlus className="top-0 left-0 hidden -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] lg:block" />
					<CornerPlus className="top-0 right-0 hidden translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] lg:block" />
					<CornerPlus className="bottom-0 left-0 hidden -translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] lg:block" />
					<CornerPlus className="bottom-0 right-0 hidden translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] lg:block" />
				</>
			)}

			{plan.id === "enterprise" && (
				<div className="absolute -bottom-12 -right-12 hidden lg:block">
					<Image
						src="/block.avif"
						alt="enterprise plan hero"
						width={800}
						height={800}
						sizes="(min-width: 1024px) 800px, 0px"
						className="size-full"
					/>
				</div>
			)}

			<div
				className={cn(
					"p-4 md:p-8 flex rounded-t-2xl lg:rounded-t-3xl flex-col items-start w-full relative",
					plan.id === "enterprise" && "pb-2 md:pb-3",
				)}
			>
				<h3
					className={cn(
						"font-medium text-xl text-foreground pt-5",
						plan.id === "enterprise" && "pt-3",
					)}
				>
					{plan.title}
				</h3>
				<p
					className={cn(
						"mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold select-none h-18",
						plan.id === "enterprise" && "mt-1",
					)}
				>
					{plan.monthlyPrice === -1 ? (
						"Custom"
					) : (
						<span>${plan.monthlyPrice}/mo</span>
					)}
				</p>
				<p
					className={cn(
						"text-sm md:text-base text-muted-foreground mt-2",
						plan.id === "enterprise" && "mt-1",
					)}
				>
					{plan.desc}
				</p>
			</div>
			<div
				className={cn(
					"flex flex-col items-start w-full px-4 py-2 md:px-8",
					plan.id === "enterprise" && "py-1 md:py-1.5",
				)}
			>
				{plan.id === "enterprise" ? (
					<Button
						size="lg"
						className="bg-primary rounded hover:bg-primary/90 w-full lg:w-1/3"
						data-cal-namespace="30min"
						data-cal-link="crosmos/30min"
						data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
						onPointerEnter={initCal}
						onFocus={initCal}
					>
						{plan.buttonText}
					</Button>
				) : (
					<Button
						asChild
						size="lg"
						className="bg-primary rounded hover:bg-primary/90 w-full"
					>
						<a href={plan.link} target="_blank" rel="noopener noreferrer">
							{plan.buttonText}
						</a>
					</Button>
				)}
				{plan.monthlyPrice !== -1 && (
					<div className="h-8 overflow-hidden w-full mx-auto">
						<span className="text-sm text-center text-muted-foreground mt-3 mx-auto block">
							Billed monthly
						</span>
					</div>
				)}
			</div>
			<div className="flex flex-col items-start w-full p-5 mb-4 ml-1 gap-y-2">
				<span className="text-sm sm:text-base text-left mb-2">Includes:</span>
				{plan.features.map((feature) => (
					<div
						key={feature}
						className="flex items-center justify-start gap-2 text-sm sm:text-base"
					>
						<div className="flex items-center justify-center">
							<IconCheck className="size-5" />
						</div>
						<span>{feature}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export function Pricing() {
	return (
		<section
			id="pricing"
			className="relative flex flex-col items-center justify-center px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24 mx-auto"
		>
			<div className="flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
				<div className="flex flex-col items-center text-center max-w-2xl mx-auto">
					<p className="text-primary font-mono font-bold uppercase text-center mb-4">
						[ Pricing ]
					</p>
					<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
						Flexible plans for every scale
					</h2>
				</div>
				<div className="grid w-full grid-cols-1 lg:grid-cols-3 pt-8 lg:pt-12">
					{PLANS.map((plan) => (
						<PlanCard key={plan.id} plan={plan} />
					))}
				</div>
			</div>
		</section>
	);
}
