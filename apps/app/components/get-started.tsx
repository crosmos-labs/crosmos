"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crosmos/ui/components/card";
import { CopyButton } from "@crosmos/ui/components/copy-button";
import { cn } from "@crosmos/ui/lib/utils";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

const INSTALL_CMD = "npm i -g @crosmos/crosmos-mcp";
const SETUP_CMD = "crosmos-mcp setup";

const MCP_CONFIG_PLAIN = `{
  "mcpServers": {
    "crosmos-memory": {
      "command": "crosmos-mcp",
      "env": {
        "CROSMOS_API_BASE_URL": "https://api.crosmos.dev/",
        "CROSMOS_API_KEY": "csk_your_api_key_here"
      }
    }
  }
}`;

function CodeBlock({
	value,
	className,
}: {
	value: string;
	className?: string;
}) {
	return (
		<div className="relative rounded-lg border bg-muted/50 p-3 pl-4">
			<div className="absolute top-2 right-2">
				<CopyButton value={value} />
			</div>
			<pre
				className={
					className ?? "text-sm font-mono whitespace-pre overflow-x-auto pr-8"
				}
			>
				{value}
			</pre>
		</div>
	);
}

function McpConfigBlock() {
	return (
		<div className="relative rounded-lg border bg-muted/50 p-3 pl-9">
			<div className="absolute top-2 right-2">
				<CopyButton value={MCP_CONFIG_PLAIN} />
			</div>
			<pre className="text-sm font-mono whitespace-pre overflow-x-auto pr-8">
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
				<span className="text-muted-foreground">"crosmos-mcp"</span>
				{","}
				{"\n"}
				{"      "}
				<span className="text-foreground">"env"</span>
				{": {"}
				{"\n"}
				{"        "}
				<span className="text-foreground">"CROSMOS_API_BASE_URL"</span>
				{": "}
				<span className="text-muted-foreground">
					"https://api.crosmos.dev/"
				</span>
				{","}
				{"\n"}
				{"        "}
				<span className="text-foreground">"CROSMOS_API_KEY"</span>
				{": "}
				<span className="text-muted-foreground">"csk_your_api_key_here"</span>
				{"\n"}
				{"      }"}
				{"\n"}
				{"    }"}
				{"\n"}
				{"  }"}
				{"\n"}
				{"}"}
			</pre>
		</div>
	);
}

const STEPS = [
	{ title: "Create a space", href: "/spaces" as const },
	{ title: "Create an API key", href: "/api-key" as const },
];

export function GetStarted() {
	return (
		<Card className="rounded">
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
					<span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium text-muted-foreground">
						3
					</span>
					<span className="text-sm font-medium">Connect with MCP</span>
				</div>
				<div className="flex flex-col gap-4 pl-9">
					<div className="flex flex-col gap-1.5">
						<span className="text-xs font-medium text-muted-foreground">
							Install the MCP package
						</span>
						<CodeBlock value={INSTALL_CMD} />
					</div>
					<div className="flex flex-col gap-1.5">
						<span className="text-xs font-medium text-muted-foreground">
							Run auto-setup
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
				<span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium text-muted-foreground">
					{number}
				</span>
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
