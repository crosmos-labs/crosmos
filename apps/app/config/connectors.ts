import type { ComponentType, SVGProps } from "react";
import {
	ClaudeAI,
	Codex,
	ModelContextProtocol,
	OpenCode,
} from "@/components/shared/provider-logos";

export type ConnectorCategoryId = "agent-plugins" | "mcp";

export interface ConnectorCategory {
	id: ConnectorCategoryId;
	label: string;
	itemLabel: string;
}

export interface ConnectorStep {
	title: string;
	note?: string;
	commands?: string[];
}

export interface Connector {
	id: string;
	name: string;
	description: string;
	category: ConnectorCategoryId;
	logo: ComponentType<SVGProps<SVGSVGElement>>;
	docsUrl: string;
	steps: ConnectorStep[];
}

export const connectorCategories: ConnectorCategory[] = [
	{ id: "agent-plugins", label: "Agent plugins", itemLabel: "Agent plugin" },
	{ id: "mcp", label: "MCP", itemLabel: "MCP server" },
];

export const connectors: Connector[] = [
	{
		id: "claude-code",
		name: "Claude Code",
		description: "Add automatic, persistent memory to Claude Code.",
		category: "agent-plugins",
		logo: ClaudeAI,
		docsUrl: "https://docs.crosmos.dev/plugins/claude-code",
		steps: [
			{
				title: "Add the plugin",
				note: "Run inside a Claude Code session.",
				commands: [
					"/plugin marketplace add crosmos-labs/claudecode-crosmos",
					"/plugin install crosmos",
				],
			},
			{
				title: "Authenticate",
				note: "Run in your terminal, not in the Claude session.",
				commands: ["npx @crosmos/crosmos-mcp setup"],
			},
		],
	},
	{
		id: "codex",
		name: "Codex",
		description: "Add persistent memory to the OpenAI Codex CLI.",
		category: "agent-plugins",
		logo: Codex,
		docsUrl: "https://docs.crosmos.dev/plugins/codex",
		steps: [
			{
				title: "Run the installer",
				note: "Run in your terminal. The installer asks for your API key and registers the hooks.",
				commands: ["npx @crosmos/codex install"],
			},
			{
				title: "Approve the hooks",
				note: "Run /hooks once inside Codex.",
			},
		],
	},
	{
		id: "opencode",
		name: "OpenCode",
		description: "Add automatic, persistent memory to opencode.",
		category: "agent-plugins",
		logo: OpenCode,
		docsUrl: "https://docs.crosmos.dev/plugins/opencode",
		steps: [
			{
				title: "Register the plugin",
				note: "Run in your terminal.",
				commands: ["bunx @crosmos/opencode install"],
			},
			{
				title: "Save your API key",
				commands: ["bunx @crosmos/opencode set-key csk_..."],
			},
		],
	},
	{
		id: "mcp-server",
		name: "Crosmos MCP",
		description: "Connect Crosmos memory tools to any MCP client.",
		category: "mcp",
		logo: ModelContextProtocol,
		docsUrl: "https://docs.crosmos.dev/mcp/overview",
		steps: [
			{
				title: "Run the interactive setup",
				note: "Run in your terminal. It configures your MCP client for you.",
				commands: ["npx @crosmos/crosmos-mcp setup"],
			},
		],
	},
];
