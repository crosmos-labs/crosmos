"use client";

import { ShimmeringText } from "@crosmos/ui/components/shimmering-text";
import {
	IconBrain,
	IconCheck,
	IconChevronDown,
	IconX,
} from "@tabler/icons-react";
import { Accordion as AccordionPrimitive } from "radix-ui";

type ToolState =
	| "input-streaming"
	| "input-available"
	| "output-available"
	| "output-error"
	| string;

// ─── search_memory ────────────────────────────────────────────────────────────

interface SearchOutput {
	count?: number;
	tookMs?: number;
	results?: Array<{ id: string; content: string; type: string; score: number }>;
	error?: string;
	retryable?: boolean;
}

interface MemorySearchCardProps {
	part: {
		state: ToolState;
		output?: unknown;
		input?: unknown;
	};
}

export function MemorySearchCard({ part }: MemorySearchCardProps) {
	const isPending =
		part.state === "input-streaming" || part.state === "input-available";

	if (isPending) {
		return (
			<ShimmeringText
				text="Searching memory…"
				className="px-1 text-sm"
				startOnView={false}
			/>
		);
	}

	if (part.state === "output-error") {
		return <ToolStatusLine icon="error">Memory search failed</ToolStatusLine>;
	}

	const out = part.output as SearchOutput | undefined;
	const tookMs = out?.tookMs;

	if (out?.error) {
		return (
			<ToolStatusLine icon="error">
				{out.retryable
					? "Memory search temporarily unavailable"
					: "Memory search failed"}
			</ToolStatusLine>
		);
	}

	const results = (out?.results ?? []).slice(0, 5);
	const count = results.length;

	if (count === 0) {
		return (
			<ToolStatusLine
				icon="brain"
				tookMs={tookMs}
				details={
					<span className="text-sm text-muted-foreground">· no matches</span>
				}
			>
				Searched memory
			</ToolStatusLine>
		);
	}

	return (
		// Use the Radix primitives directly so we own all padding/height — the
		// AccordionContent wrapper from @crosmos/ui adds an inner div with a
		// hardcoded pb-2.5 that can't be overridden via className and causes the
		// gap between the dropdown and the assistant text to grow on each toggle.
		<AccordionPrimitive.Root type="single" collapsible>
			<AccordionPrimitive.Item value="results">
				<AccordionPrimitive.Header className="flex">
					<AccordionPrimitive.Trigger className="group/trigger flex cursor-pointer items-center gap-1.5 text-left outline-none">
						<IconBrain className="size-3.5 shrink-0 text-muted-foreground" />
						<span className="inline-flex items-baseline gap-1.5 text-sm text-muted-foreground">
							Searched memory
							<ToolTiming tookMs={tookMs} />
						</span>
						<IconChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/trigger:rotate-180" />
						<span className="text-sm text-muted-foreground">
							<span className="font-medium text-foreground">{count}</span>{" "}
							{count === 1 ? "result" : "results"}
						</span>
					</AccordionPrimitive.Trigger>
				</AccordionPrimitive.Header>

				<AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
					<div className="mt-2 space-y-2 rounded-lg bg-muted/40 px-3 py-2.5">
						{results.map((result) => (
							<p
								key={result.id}
								className="line-clamp-2 text-xs text-muted-foreground"
							>
								{result.content}
							</p>
						))}
					</div>
				</AccordionPrimitive.Content>
			</AccordionPrimitive.Item>
		</AccordionPrimitive.Root>
	);
}

// ─── save_memory ──────────────────────────────────────────────────────────────

interface SaveOutput {
	status?: string;
	jobId?: string;
	tookMs?: number;
	error?: string;
	retryable?: boolean;
}

interface MemorySaveChipProps {
	part: {
		state: ToolState;
		output?: unknown;
		input?: unknown;
	};
}

export function MemorySaveChip({ part }: MemorySaveChipProps) {
	const isPending =
		part.state === "input-streaming" || part.state === "input-available";

	if (isPending) {
		return (
			<ShimmeringText
				text="Saving to memory…"
				className="px-1 text-sm"
				startOnView={false}
			/>
		);
	}

	if (part.state === "output-error") {
		return (
			<ToolStatusLine icon="error">Couldn't save to memory</ToolStatusLine>
		);
	}

	const out = part.output as SaveOutput | undefined;
	const inp = part.input as { content?: string } | undefined;
	const savedContent = inp?.content;
	const tookMs = out?.tookMs;

	if (out?.error) {
		return (
			<ToolStatusLine icon="error">
				{out.retryable
					? "Memory save temporarily unavailable"
					: "Couldn't save to memory"}
			</ToolStatusLine>
		);
	}

	return (
		<span
			className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
			title={savedContent ? `Saved: "${savedContent}"` : undefined}
		>
			<IconCheck className="size-3.5 shrink-0 text-primary" />
			Saved to memory
			<ToolTiming tookMs={tookMs} />
		</span>
	);
}

// ─── shared ───────────────────────────────────────────────────────────────────

function ToolStatusLine({
	icon,
	tookMs,
	details,
	children,
}: {
	icon: "brain" | "error";
	tookMs?: number;
	details?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
			{icon === "brain" ? (
				<IconBrain className="size-3.5 shrink-0" />
			) : (
				<IconX className="size-3.5 shrink-0 text-destructive" />
			)}
			{children}
			<ToolTiming tookMs={tookMs} />
			{details}
		</span>
	);
}

function ToolTiming({ tookMs }: { tookMs?: number }) {
	if (tookMs === undefined) {
		return null;
	}

	return <span className="text-xs">in {(tookMs / 1000).toFixed(1)}s</span>;
}
