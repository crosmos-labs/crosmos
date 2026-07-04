"use client";

import { Button } from "@crosmos/ui/components/button";
import { CopyButton } from "@crosmos/ui/components/copy-button";
import { ScrollArea } from "@crosmos/ui/components/scroll-area";
import { Separator } from "@crosmos/ui/components/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@crosmos/ui/components/sheet";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { cn } from "@crosmos/ui/lib/utils";
import { IconArrowUpRight, IconCode, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { SourceStatusPill } from "@/components/sources/source-status";
import { useSource } from "@/hooks/use-source";
import { parseConversationTurns } from "@/lib/conversation";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import {
	contentTypeIcon,
	contentTypeLabel,
	sourceErrorMessage,
	sourceTitle,
} from "@/lib/source-labels";
import { parseSourceMeta } from "@/lib/source-meta";
import type { SourceSummary } from "@/lib/types/source";

const CONTENT_RENDER_LIMIT = 20_000;

const TURN_NODE_CLASSES: Record<string, string> = {
	user: "bg-primary",
	assistant: "border border-muted-foreground/40",
};

function shortId(id: string): string {
	return `${id.slice(0, 8)}…`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex min-w-0 flex-col gap-0.5">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="min-w-0 truncate text-sm">{children}</span>
		</div>
	);
}

export function SourceDetailSheet({
	source,
	spaceName,
	onOpenChange,
	onRequestDelete,
}: {
	source: SourceSummary | null;
	spaceName: string | null;
	onOpenChange: (open: boolean) => void;
	onRequestDelete: (source: SourceSummary) => void;
}) {
	// Render from the last non-null source while closing so the exit
	// animation doesn't slide out an empty panel.
	const [cachedSource, setCachedSource] = useState<SourceSummary | null>(null);
	const [showExpanded, setShowExpanded] = useState(false);
	const [prevSource, setPrevSource] = useState<SourceSummary | null>(source);
	if (source !== prevSource) {
		setPrevSource(source);
		if (source) {
			setCachedSource(source);
			setShowExpanded(false);
		}
	}
	const display = source ?? cachedSource;

	const {
		data: detail,
		isLoading,
		error,
		mutate,
	} = useSource(display?.id ?? null, display?.space_id ?? null);

	const meta = useMemo(() => parseSourceMeta(display?.meta ?? null), [display]);
	const errorMessage = display ? sourceErrorMessage(display.meta) : null;
	const content = detail?.content ?? "";

	const turnItems = useMemo(() => {
		if (display?.content_type !== "conversation" || !content) return null;
		const turns = parseConversationTurns(content);
		return (
			turns?.map((turn, index) => ({ ...turn, key: `turn-${index}` })) ?? null
		);
	}, [display?.content_type, content]);

	const clampedTurns = useMemo(() => {
		if (!turnItems) return null;
		if (showExpanded) return { turns: turnItems, truncated: false };
		const turns: typeof turnItems = [];
		let budget = CONTENT_RENDER_LIMIT;
		for (const turn of turnItems) {
			turns.push(
				turn.text.length > budget
					? { ...turn, text: turn.text.slice(0, budget) }
					: turn,
			);
			budget -= turn.text.length;
			if (budget <= 0) break;
		}
		return { turns, truncated: turns.length < turnItems.length || budget < 0 };
	}, [turnItems, showExpanded]);

	const turnCountLabel = turnItems
		? `${turnItems.length} turn${turnItems.length === 1 ? "" : "s"}`
		: null;
	const isClamped = !showExpanded && content.length > CONTENT_RENDER_LIMIT;
	const ContentTypeIcon = display
		? contentTypeIcon(display.content_type)
		: null;
	const ConnectorLogo = meta.connector?.logo ?? null;

	return (
		<Sheet open={!!source} onOpenChange={onOpenChange}>
			<SheetContent className="gap-0 data-[side=right]:sm:max-w-lg">
				{display && ContentTypeIcon && (
					<>
						<SheetHeader className="border-b">
							<span className="text-sm font-medium">Source details</span>
						</SheetHeader>
						<ScrollArea className="min-h-0 flex-1 [&_[data-slot=scroll-area-viewport]>div]:block!">
							<div className="flex flex-col">
								<div className="flex flex-col gap-4 p-4">
									<div className="flex items-center gap-3">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
											<ContentTypeIcon className="size-5 text-muted-foreground" />
										</div>
										<SheetTitle className="min-w-0 flex-1 truncate font-semibold">
											{sourceTitle(display)}
										</SheetTitle>
										<SourceStatusPill status={display.extraction_status} />
									</div>
									<div className="flex items-center gap-3">
										<div
											className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50"
											title={meta.connector?.name ?? "API"}
										>
											{ConnectorLogo ? (
												<ConnectorLogo className="size-5" />
											) : (
												<IconCode className="size-5 text-muted-foreground" />
											)}
										</div>
										<div className="flex min-w-0 flex-1 flex-col gap-0.5">
											<span className="text-xs text-muted-foreground">
												Ingested
											</span>
											<span className="truncate text-sm">
												{formatDateTime(display.created_at)}
											</span>
										</div>
										<div className="flex shrink-0 items-center gap-2">
											<Button variant="outline" size="sm" asChild>
												<Link href={`/spaces/${display.space_id}`}>
													<IconArrowUpRight />
													View space
												</Link>
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => onRequestDelete(display)}
											>
												<IconTrash />
												Delete
											</Button>
										</div>
									</div>
									{errorMessage && (
										<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
											{errorMessage}
										</div>
									)}
								</div>
								<Separator />
								<div className="grid grid-cols-2 gap-4 p-4">
									<Field label="Space">
										<Link
											href={`/spaces/${display.space_id}`}
											className="underline-offset-4 hover:underline"
										>
											{spaceName ?? "View space"}
										</Link>
									</Field>
									<Field label="Type">
										{contentTypeLabel(display.content_type)}
									</Field>
									<Field label="Tokens">
										{display.token_count.toLocaleString()}
									</Field>
									<Field label="Updated">
										{formatDateTime(display.updated_at)}
									</Field>
									<Field label="ID">
										<span className="inline-flex items-center gap-1">
											<span className="font-mono">{shortId(display.id)}</span>
											<CopyButton value={display.id} className="size-5" />
										</span>
									</Field>
									{meta.session && (
										<Field label="Session">
											<span className="inline-flex items-center gap-1">
												<span className="font-mono">
													{shortId(meta.session)}
												</span>
												<CopyButton value={meta.session} className="size-5" />
											</span>
										</Field>
									)}
									{meta.repo && (
										<Field label="Repository">
											{meta.repo.url ? (
												<a
													href={meta.repo.url}
													target="_blank"
													rel="noreferrer"
													className="inline-flex max-w-full items-center gap-1 underline-offset-4 hover:underline"
												>
													<span className="truncate">
														{meta.repo.ownerRepo}
														{meta.repo.branch && ` @ ${meta.repo.branch}`}
													</span>
													<IconArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
												</a>
											) : (
												<>
													{meta.repo.ownerRepo}
													{meta.repo.branch && ` @ ${meta.repo.branch}`}
												</>
											)}
										</Field>
									)}
									{meta.project && (
										<Field label="Project">{meta.project}</Field>
									)}
									{meta.sessionDate && (
										<Field label="Session date">
											{formatDate(meta.sessionDate)}
										</Field>
									)}
									{meta.extras.map(([key, value]) => (
										<Field key={key} label={key}>
											{value}
										</Field>
									))}
								</div>
								<Separator />
								<div className="flex flex-col gap-3 p-4">
									<div className="flex items-center justify-between">
										<span className="text-[0.68rem] font-semibold text-foreground/70 uppercase tracking-widest">
											Content
											{turnCountLabel && ` · ${turnCountLabel}`}
										</span>
										{content && !error && (
											<CopyButton value={content} className="-my-1.5" />
										)}
									</div>
									{isLoading ? (
										<div className="flex flex-col gap-2">
											<Skeleton className="h-3.5 w-full" />
											<Skeleton className="h-3.5 w-11/12" />
											<Skeleton className="h-3.5 w-4/5" />
											<Skeleton className="h-3.5 w-2/3" />
										</div>
									) : error ? (
										<div className="flex items-center gap-3 text-sm text-muted-foreground">
											Failed to load content.
											<Button
												variant="outline"
												size="sm"
												onClick={() => mutate()}
											>
												Try again
											</Button>
										</div>
									) : clampedTurns ? (
										<div className="flex flex-col">
											{clampedTurns.turns.map((turn, index) => (
												<div key={turn.key} className="flex gap-3">
													<div className="flex flex-col items-center">
														<span
															className={cn(
																"mt-1 size-2.5 shrink-0 rounded-full",
																TURN_NODE_CLASSES[turn.role.toLowerCase()] ??
																	"bg-muted-foreground/40",
															)}
														/>
														{index < clampedTurns.turns.length - 1 && (
															<span className="my-1 flex-1 border-l border-dashed border-border" />
														)}
													</div>
													<div
														className={cn(
															"flex min-w-0 flex-1 flex-col gap-1",
															index < clampedTurns.turns.length - 1 && "pb-5",
														)}
													>
														<span className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-widest">
															{turn.role}
														</span>
														<p className="whitespace-pre-wrap wrap-break-word text-sm">
															{turn.text}
														</p>
													</div>
												</div>
											))}
											{clampedTurns.truncated && (
												<Button
													variant="outline"
													size="sm"
													className="mt-3 self-start"
													onClick={() => setShowExpanded(true)}
												>
													Show all {turnCountLabel}
												</Button>
											)}
										</div>
									) : (
										<>
											<p className="whitespace-pre-wrap wrap-break-word text-sm">
												{isClamped
													? content.slice(0, CONTENT_RENDER_LIMIT)
													: content}
											</p>
											{isClamped && (
												<div className="flex items-center gap-3">
													<Button
														variant="outline"
														size="sm"
														onClick={() => setShowExpanded(true)}
													>
														Show full content
													</Button>
													<span className="text-xs text-muted-foreground">
														{formatNumber(
															content.length - CONTENT_RENDER_LIMIT,
														)}{" "}
														more characters
													</span>
												</div>
											)}
										</>
									)}
								</div>
							</div>
						</ScrollArea>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
