"use client";

import { Button } from "@crosmos/ui/components/button";
import { cn } from "@crosmos/ui/lib/utils";
import NumberFlow from "@number-flow/react";
import { IconCheck } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { LINKS } from "@/config/links";
import { CornerPlus } from "./ui/corner-plus";

type Plan = "monthly" | "annually";

type PLAN = {
	id: string;
	title: string;
	desc: string;
	monthlyPrice: number;
	annuallyPrice: number;
	badge?: string;
	buttonText: string;
	features: string[];
	link: string;
};

export const PLANS: PLAN[] = [
	{
		id: "basic",
		title: "Basic",
		desc: "Perfect for people to get started with having a mini memory in your apps",
		monthlyPrice: 0,
		annuallyPrice: 0,
		buttonText: "Get Started",
		features: [
			"500K tokens/month",
			"5K queries/month",
			"3 memory spaces",
			"10/min - 1k/day rate limit",
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
		annuallyPrice: 228,
		badge: "Most Popular",
		buttonText: "Upgrade to Developer",
		features: [
			"5M tokens/month",
			"50K queries/month",
			"7 memory spaces",
			"60/min - 10k/day rate limit",
			"MCP server integration",
			"Pre-built data connectors",
			"Priority email support",
		],
		link: "#",
	},
	{
		id: "pro",
		title: "Pro",
		desc: "For teams that need unlimited scale, advanced observability, and dedicated support.",
		monthlyPrice: 299,
		annuallyPrice: 3588,
		buttonText: "Upgrade to Pro",
		features: [
			"80M tokens/month",
			"300K queries/month",
			"50 memory spaces",
			"300/min - 50k/day rate limit",
			"MCP server integration",
			"Pre-built data connectors",
			"Dedicated support channel",
			"Full observability & tracing",
		],
		link: "#",
	},
	{
		id: "enterprise",
		title: "Enterprise",
		desc: "For large organizations requiring advanced security and control.",
		monthlyPrice: -1,
		annuallyPrice: -1,
		buttonText: "Contact Sales",
		features: [
			"Unlimited tokens",
			"Unlimited search queries",
			"Unlimited memory spaces",
			"Self-hosted deployment option",
		],
		link: "#",
	},
];

const Plan = ({ plan, billPlan }: { plan: PLAN; billPlan: Plan }) => {
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
						src="/block.png"
						alt="enterprise plan hero"
						width={800}
						height={800}
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
						<>
							{plan.monthlyPrice > 0 && <span>*</span>}
							<NumberFlow
								value={
									billPlan === "monthly"
										? plan.monthlyPrice
										: plan.annuallyPrice
								}
								suffix={billPlan === "monthly" ? "/mo" : "/yr"}
								format={{
									currency: "USD",
									style: "currency",
									currencySign: "standard",
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
									currencyDisplay: "narrowSymbol",
								}}
							/>
						</>
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
				<Button
					disabled={plan.id !== "basic"}
					size="lg"
					className={cn(
						"bg-accent rounded hover:bg-accent/90 w-full",
						plan.id === "enterprise" && "lg:w-1/3",
					)}
				>
					{plan.id === "basic" ? (
						<a
							href={plan.link}
							target="_blank"
							rel="noopener noreferrer"
							className="w-full"
						>
							{plan.buttonText}
						</a>
					) : (
						"Coming Soon"
					)}
				</Button>
				{plan.monthlyPrice !== -1 && (
					<div className="h-8 overflow-hidden w-full mx-auto">
						<AnimatePresence mode="wait">
							<motion.span
								key={billPlan}
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								exit={{ y: -20, opacity: 0 }}
								transition={{ duration: 0.2, ease: "easeOut" }}
								className="text-sm text-center text-muted-foreground mt-3 mx-auto block"
							>
								{billPlan === "monthly"
									? "Billed monthly"
									: "Billed in one annual payment"}
							</motion.span>
						</AnimatePresence>
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
	const [billPlan, setBillPlan] = useState<Plan>("monthly");

	const _handleSwitch = () => {
		setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
	};

	return (
		<section
			id="pricing"
			className="relative flex flex-col items-center justify-center px-6 lg:px-8 xl:px-0 py-16 sm:py-20 lg:py-24 mx-auto"
		>
			<div className="flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
				<div className="flex flex-col items-center text-center max-w-2xl mx-auto">
					<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-6">
						Pricing
					</h2>
					<p className="text-base md:text-lg text-center text-foreground/80 mt-6">
						Efficient by design—so your agents grow smarter over time without
						growing heavier.
					</p>
				</div>
				{/* Billing toggle - hidden for now
				<div className="sticky top-20 sm:top-16.25 lg:static lg:top-auto z-10 bg-background py-3 -mx-6 px-6 lg:mx-0 lg:px-0 lg:py-0 flex items-center justify-center space-x-4 mt-6 w-full">
					<span className="text-sm sm:text-base font-medium">Monthly</span>
					<button
						onClick={handleSwitch}
						role="switch"
						aria-checked={billPlan === "annually"}
						aria-label="Toggle between monthly and annual billing"
						className="relative rounded-full focus:outline-none"
					>
						<div className="w-12 h-6 transition rounded-full shadow-md outline-none bg-accent/90"></div>
						<div
							className={cn(
								"absolute inline-flex items-center justify-center size-4 transition-all duration-500 ease-in-out top-1 left-1 rounded-full bg-white",
								billPlan === "annually" ? "translate-x-6" : "translate-x-0",
							)}
						/>
					</button>
					<span className="text-sm sm:text-base font-medium">Annually</span>
				</div>
				*/}
				<div className="grid w-full grid-cols-1 lg:grid-cols-3 pt-8 lg:pt-12">
					{PLANS.map((plan) => (
						<Plan key={plan.id} plan={plan} billPlan={billPlan} />
					))}
				</div>
				<p className="text-sm text-muted-foreground mt-4 text-right w-full">
					* Prices are not final and may change upon official release.
				</p>
			</div>
		</section>
	);
}
