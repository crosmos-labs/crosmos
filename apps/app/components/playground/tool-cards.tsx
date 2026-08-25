"use client";

import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@crosmos/ui/components/hover-card";
import { ShimmeringText } from "@crosmos/ui/components/shimmering-text";
import {
	IconBrain,
	IconCheck,
	IconChevronDown,
	IconX,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { MemberAvatar } from "@/components/members/member-avatar";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMembers } from "@/hooks/use-members";
import type { MemberResponse } from "@/lib/types/org";

type ToolState =
	| "input-streaming"
	| "input-available"
	| "output-available"
	| "output-error"
	| string;

// ─── search_memory ────────────────────────────────────────────────────────────

interface SearchOutput {
	count?: number;
	results?: Array<{
		id: string;
		content: string;
		source_id: string | null;
		type: string;
		score: number;
		owner?: string | null;
	}>;
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
	const out = part.output as SearchOutput | undefined;
	const results = out?.results ?? [];

	// The owner icon marks memories from someone else (surfaced via org
	// visibility). Rows resolve only once the viewer's name is known, so own
	// rows never flash an avatar; members back the hover card and are fetched
	// only when a foreign owner is actually visible.
	const { data: user } = useCurrentUser();
	const orgId = useActiveOrgId();
	const selfName = user?.name;
	const hasForeignOwner =
		selfName !== undefined &&
		results.some((r) => r.owner != null && r.owner !== selfName);
	const { data: members } = useMembers(hasForeignOwner ? orgId : null);

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

	if (out?.error) {
		return (
			<ToolStatusLine icon="error">
				{out.retryable
					? "Memory search temporarily unavailable"
					: "Memory search failed"}
			</ToolStatusLine>
		);
	}

	const count = results.length;

	const membersByName = new Map<string, MemberResponse[]>();
	for (const m of members ?? []) {
		const list = membersByName.get(m.name);
		if (list) list.push(m);
		else membersByName.set(m.name, [m]);
	}

	if (count === 0) {
		return (
			<ToolStatusLine
				icon="brain"
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
						{results.map((result) => {
							const owner =
								selfName !== undefined &&
								result.owner != null &&
								result.owner !== selfName
									? result.owner
									: null;
							// Exactly one member with this name → rich hover card;
							// on a collision or no match, degrade to name-only.
							const matches = owner ? (membersByName.get(owner) ?? []) : [];
							return (
								<div key={result.id} className="flex items-start gap-2">
									{owner && (
										<MemoryOwner
											name={owner}
											member={
												matches.length === 1 ? (matches[0] ?? null) : null
											}
										/>
									)}
									<p className="line-clamp-2 min-w-0 flex-1 text-xs text-muted-foreground">
										{result.content}
									</p>
								</div>
							);
						})}
					</div>
				</AccordionPrimitive.Content>
			</AccordionPrimitive.Item>
		</AccordionPrimitive.Root>
	);
}

/** Initials avatar for a teammate's memory, with a hover card. `member` is the
 * unambiguous org-member match (null → show the name only, never guess). */
function MemoryOwner({
	name,
	member,
}: {
	name: string;
	member: MemberResponse | null;
}) {
	return (
		<HoverCard openDelay={200}>
			<HoverCardTrigger asChild>
				<button
					type="button"
					aria-label={`Memory from ${name}`}
					className="shrink-0 cursor-default rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<MemberAvatar name={name} email={member?.email ?? ""} size="sm" />
				</button>
			</HoverCardTrigger>
			<HoverCardContent align="start" side="top" className="w-auto max-w-64">
				<div className="flex items-center gap-2.5">
					<MemberAvatar name={name} email={member?.email ?? ""} />
					<div className="min-w-0">
						<p className="truncate font-medium">{name}</p>
						{member && (
							<p className="truncate text-xs text-muted-foreground">
								{member.email}
							</p>
						)}
					</div>
				</div>
				{member && (
					<p className="mt-2 text-xs text-muted-foreground">
						<span className="capitalize">{member.role}</span> · Joined{" "}
						{formatDistanceToNow(new Date(member.joined_at), {
							addSuffix: true,
						})}
					</p>
				)}
			</HoverCardContent>
		</HoverCard>
	);
}

// ─── save_memory ──────────────────────────────────────────────────────────────

interface SaveOutput {
	status?: string;
	jobId?: string;
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
		</span>
	);
}

// ─── shared ───────────────────────────────────────────────────────────────────

function ToolStatusLine({
	icon,
	details,
	children,
}: {
	icon: "brain" | "error";
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
			{details}
		</span>
	);
}
