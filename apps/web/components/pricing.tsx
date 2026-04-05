"use client";

import { Button } from "@crosmos/ui/components/button";
import { cn } from "@crosmos/ui/lib/utils";
import NumberFlow from "@number-flow/react";
import { IconCheck } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
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
		desc: "Perfect for people to get started with having a mini memeory in your apps",
		monthlyPrice: 0,
		annuallyPrice: 0,
		buttonText: "Get Started",
		features: [
			"1 Organization workspace",
			"Up to 2 team members",
			"10,000 tokens per month",
			"Access to community plugins",
			"Community email support",
		],
		link: "#",
	},
	{
		id: "pro",
		title: "Pro",
		desc: "For growing teams that need more power and flexibility.",
		monthlyPrice: 30,
		annuallyPrice: 330,
		badge: "Most Popular",
		buttonText: "Upgrade to Pro",
		features: [
			"Unlimited organizations",
			"Up to 10 team members",
			"100,000 tokens per month",
			"Custom plugin development",
			"MCP server integration",
			"Pre-built data connectors",
			"Custom ontology builder",
			"Priority email support",
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
			"Unlimited organizations",
			"Unlimited team members",
			"Unlimited tokens",
			"Custom plugin development",
			"MCP server integration",
			"Pre-built data connectors",
			"Custom ontology builder",
			"Dedicated support channel",
			"Full observability & tracing",
			"Self-hosted deployment option",
		],
		link: "#",
	},
	// ].filter((p) => p.id === "enterprise");
];

const Plan = ({ plan, billPlan }: { plan: PLAN; billPlan: Plan }) => {
	return (
		<div
			className={cn(
				"flex flex-col relative bg-background items-start w-full border-foreground/10 border-2 hover:bg-card/60 transition-colors hover:transition-none duration-300",
				plan.id === "pro" && "border-x-0",
			)}
		>
			{plan.title === "Pro" && (
				<>
					<CornerPlus className="top-0 left-0 hidden -translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] lg:block" />
					<CornerPlus className="top-0 right-0 hidden translate-x-[calc(50%+0.5px)] -translate-y-[calc(50%+0.5px)] lg:block" />
					<CornerPlus className="bottom-0 left-0 hidden -translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] lg:block" />
					<CornerPlus className="bottom-0 right-0 hidden translate-x-[calc(50%+0.5px)] translate-y-[calc(50%+0.5px)] lg:block" />
				</>
			)}

			<div className="p-4 md:p-8 flex rounded-t-2xl lg:rounded-t-3xl flex-col items-start w-full relative">
				<h2 className="font-medium text-xl text-foreground pt-5">
					{plan.title}
				</h2>
				<h3 className="mt-3 text-2xl font-bold md:text-5xl select-none h-18">
					{plan.monthlyPrice === -1 ? (
						"Custom"
					) : (
						<NumberFlow
							value={
								billPlan === "monthly" ? plan.monthlyPrice : plan.annuallyPrice
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
					)}
				</h3>
				<p className="text-sm md:text-base text-muted-foreground mt-2">
					{plan.desc}
				</p>
			</div>
			<div className="flex flex-col items-start w-full px-4 py-2 md:px-8">
				<Button
					size="lg"
					className="w-full bg-accent rounded hover:bg-accent/90"
				>
					{plan.buttonText}
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
				<span className="text-base text-left mb-2">Includes:</span>
				{plan.features.map((feature) => (
					<div key={feature} className="flex items-center justify-start gap-2">
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

	const handleSwitch = () => {
		setBillPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
	};

	return (
		<div
			id="pricing"
			className="relative flex flex-col items-center justify-center py-16 mx-auto"
		>
			<div className="flex flex-col items-center justify-center max-w-7xl mx-auto">
				<div className="flex flex-col items-center text-center max-w-2xl mx-auto">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-6">
						Pricing
					</h2>
					<p className="text-base md:text-lg text-center text-foreground/80 mt-6">
						Efficient by design—so your agents grow smarter over time without
						growing heavier.
					</p>
				</div>
				<div className="flex items-center justify-center space-x-4 mt-6">
					<span className="text-base font-medium">Monthly</span>
					<button
						onClick={handleSwitch}
						className="relative rounded-full focus:outline-none"
					>
						<div className="w-12 h-6 transition rounded-full shadow-md outline-none bg-accent/90"></div>
						<div
							className={cn(
								"absolute inline-flex items-center justify-center w-4 h-4 transition-all duration-500 ease-in-out top-1 left-1 rounded-full bg-white",
								billPlan === "annually" ? "translate-x-6" : "translate-x-0",
							)}
						/>
					</button>
					<span className="text-base font-medium">Annually</span>
				</div>
			</div>

			<div className="grid w-full grid-cols-1 lg:grid-cols-3 pt-8 lg:pt-12 max-w-7xl mx-auto">
				{PLANS.map((plan) => (
					<Plan key={plan.id} plan={plan} billPlan={billPlan} />
				))}
			</div>
		</div>
	);
}
