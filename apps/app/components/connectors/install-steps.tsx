"use client";

import type { ReactNode } from "react";
import { CodeBlock } from "@/components/shared/code-block";
import { StepBadge } from "@/components/shared/step-badge";
import type { Connector } from "@/config/connectors";

function StepRow({
	number,
	title,
	children,
}: {
	number: number;
	title: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex gap-3">
			<StepBadge number={number} />
			<div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
				<span className="text-sm font-medium leading-tight">{title}</span>
				{children}
			</div>
		</div>
	);
}

export function InstallSteps({ connector }: { connector: Connector }) {
	return (
		<div className="flex flex-col gap-5">
			{connector.steps.map((step, index) => (
				<StepRow key={step.title} number={index + 1} title={step.title}>
					{step.note && (
						<span className="text-sm text-muted-foreground">{step.note}</span>
					)}
					{step.commands?.map((command) => (
						<CodeBlock key={command} value={command} />
					))}
				</StepRow>
			))}
		</div>
	);
}
