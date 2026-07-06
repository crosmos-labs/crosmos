"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crosmos/ui/components/card";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { CodeBlock } from "@/components/shared/code-block";
import { StepBadge } from "@/components/shared/step-badge";

const SETUP_CMD = "npx @crosmos/crosmos-mcp setup";

const MCP_CONFIG_PLAIN = `{
  "mcpServers": {
    "crosmos-memory": {
      "command": "npx",
      "args": ["-y", "@crosmos/crosmos-mcp"]
    }
  }
}`;

function McpConfigBlock() {
	return (
		<CodeBlock value={MCP_CONFIG_PLAIN}>
			{"{"}
			{"\n"}
			{"  "}
			<span className="text-foreground">"mcpServers"</span>
			{": {"}
			{"\n"}
			{"    "}
			<span className="text-foreground">"crosmos-memory"</span>
			{": {"}
			{"\n"}
			{"      "}
			<span className="text-foreground">"command"</span>
			{": "}
			<span className="text-muted-foreground">"npx"</span>
			{","}
			{"\n"}
			{"      "}
			<span className="text-foreground">"args"</span>
			{": ["}
			<span className="text-muted-foreground">"-y"</span>
			{", "}
			<span className="text-muted-foreground">"@crosmos/crosmos-mcp"</span>
			{"]"}
			{"\n"}
			{"    }"}
			{"\n"}
			{"  }"}
			{"\n"}
			{"}"}
		</CodeBlock>
	);
}

const STEPS = [
	{ title: "Create a space", href: "/spaces" as const },
	{ title: "Create an API key", href: "/api-key" as const },
];

export function GetStarted() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Get Started</CardTitle>
				<CardDescription>
					Set up your workspace to start storing and retrieving memories.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-5">
				{STEPS.map((step, index) => (
					<GetStartedItem
						key={step.href}
						number={index + 1}
						title={step.title}
						href={step.href}
					/>
				))}
				<div className="flex items-center gap-3">
					<StepBadge number={3} />
					<span className="text-sm font-medium">Connect with MCP</span>
				</div>
				<div className="flex flex-col gap-4 pl-9">
					<div className="flex flex-col gap-1.5">
						<span className="text-xs font-medium text-muted-foreground">
							Run interactive setup
						</span>
						<CodeBlock value={SETUP_CMD} />
					</div>
					<div className="flex flex-col gap-1.5">
						<span className="text-xs font-medium text-muted-foreground">
							Or configure manually
						</span>
						<McpConfigBlock />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function GetStartedItem({
	number,
	title,
	href,
}: {
	number: number;
	title: string;
	href: string;
}) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				<StepBadge number={number} />
				<span className="text-sm font-medium">{title}</span>
			</div>
			<Link
				href={href}
				className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
			>
				Set up
				<IconArrowRight size={14} />
			</Link>
		</div>
	);
}
