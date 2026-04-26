"use client";

import { AnimatedCheckbox } from "@crosmos/ui/components/animated-checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crosmos/ui/components/card";
import { CopyButton } from "@crosmos/ui/components/copy-button";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import type { ApiKey } from "@/lib/types/api-key";
import type { Space } from "@/lib/types/space";

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

function McpConfigBlock() {
	return (
		<div className="relative rounded-lg border bg-muted/50 p-3 pl-9">
			<div className="absolute top-4 right-4">
				<CopyButton value={MCP_CONFIG_PLAIN} />
			</div>
			<pre className="text-sm font-mono whitespace-pre overflow-x-auto">
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

export function GetStarted({
	spaces,
	keys,
}: {
	spaces: Space[];
	keys: ApiKey[];
}) {
	const hasSpace = spaces.length > 0;
	const hasActiveKey = keys.some((k) => k.is_active);

	return (
		<Card className="rounded">
			<CardHeader>
				<CardTitle>Get Started</CardTitle>
				<CardDescription>
					Set up your workspace to start storing and retrieving memories.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-5">
				<GetStartedItem
					checked={hasSpace}
					title="Create a space"
					href="/spaces"
				/>
				<GetStartedItem
					checked={hasActiveKey}
					title="Create an API key"
					href="/api-key"
				/>
				<div className="flex flex-col gap-3">
					<AnimatedCheckbox title="Connect with MCP" checked={false} />
					<McpConfigBlock />
				</div>
			</CardContent>
		</Card>
	);
}

function GetStartedItem({
	checked,
	title,
	href,
}: {
	checked: boolean;
	title: string;
	href: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<AnimatedCheckbox title={title} checked={checked} />
			<Link
				href={href}
				className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
			>
				{checked ? "View" : "Set up"}
				<IconArrowRight size={14} />
			</Link>
		</div>
	);
}
