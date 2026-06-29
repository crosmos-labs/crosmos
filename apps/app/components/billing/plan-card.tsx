"use client";

import { Badge } from "@crosmos/ui/components/badge";
import { Button } from "@crosmos/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crosmos/ui/components/card";
import { cn } from "@crosmos/ui/lib/utils";
import { IconCheck } from "@tabler/icons-react";
import { capitalize, formatNumber } from "@/lib/format";
import type { PlanInfo, PurchasablePlan } from "@/lib/types/billing";

const SALES_EMAIL = "sales@crosmos.dev";

function priceLabel(plan: PlanInfo): string {
	if (plan.status === "coming_soon") return "Custom";
	if (plan.price_usd === 0) return "Free";
	return `$${plan.price_usd}/mo`;
}

function limitLabel(value: number): string {
	return value === -1 ? "Unlimited" : formatNumber(value);
}

export function PlanCard({
	plan,
	isCurrent,
	isRecommended,
	hasLiveSub,
	isOwner,
	busy,
	onUpgrade,
	onManage,
}: {
	plan: PlanInfo;
	isCurrent: boolean;
	isRecommended: boolean;
	hasLiveSub: boolean;
	isOwner: boolean;
	busy: boolean;
	onUpgrade: (plan: PurchasablePlan) => void;
	onManage: () => void;
}) {
	const isEnterprise = plan.status === "coming_soon";
	const isPurchasable = plan.plan === "developer" || plan.plan === "pro";

	const features = [
		`${limitLabel(plan.max_memory_spaces)} memory spaces`,
		`${limitLabel(plan.monthly_tokens_ingested)} tokens / mo`,
		`${limitLabel(plan.monthly_search_queries)} queries / mo`,
	];

	let cta: React.ReactNode;
	if (isCurrent) {
		cta = (
			<Button variant="outline" className="w-full" disabled>
				Current plan
			</Button>
		);
	} else if (isEnterprise) {
		cta = (
			<Button asChild variant="outline" className="w-full">
				<a href={`mailto:${SALES_EMAIL}`}>Contact sales</a>
			</Button>
		);
	} else if (hasLiveSub) {
		cta = (
			<Button
				variant="outline"
				className="w-full active:scale-[0.97] motion-reduce:transition-none"
				disabled={!isOwner || busy}
				onClick={onManage}
			>
				Change plan
			</Button>
		);
	} else if (isPurchasable) {
		cta = (
			<Button
				variant={isRecommended ? "default" : "outline"}
				className="w-full active:scale-[0.97] motion-reduce:transition-none"
				disabled={!isOwner || busy}
				onClick={() => onUpgrade(plan.plan as PurchasablePlan)}
			>
				Upgrade
			</Button>
		);
	} else {
		cta = (
			<Button variant="outline" className="w-full" disabled>
				Current plan
			</Button>
		);
	}

	return (
		<Card
			size="sm"
			className={cn("justify-between", isRecommended && "ring-2 ring-primary")}
		>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					{capitalize(plan.plan)}
					{isRecommended && <Badge>Recommended</Badge>}
				</CardTitle>
				<CardDescription className="text-base font-medium text-foreground">
					{priceLabel(plan)}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<ul className="flex flex-col gap-2">
					{features.map((feature) => (
						<li
							key={feature}
							className="flex items-center gap-2 text-sm text-muted-foreground"
						>
							<IconCheck className="size-4 shrink-0 text-foreground" />
							{feature}
						</li>
					))}
				</ul>
				{cta}
			</CardContent>
		</Card>
	);
}
