"use client";

import { Button } from "@crosmos/ui/components/button";
import { ScrollArea } from "@crosmos/ui/components/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crosmos/ui/components/sheet";
import { Skeleton } from "@crosmos/ui/components/skeleton";
import { IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SourceStatus } from "@/components/sources/source-status";
import { useSource } from "@/hooks/use-source";
import {
	CONTENT_TYPE_ICONS,
	CONTENT_TYPE_LABELS,
	sourceErrorMessage,
	sourceTitle,
} from "@/lib/source-labels";
import type { SourceSummary } from "@/lib/types/source";

function formatDateTime(iso: string): string {
	return new Date(iso).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="text-muted-foreground">{label}</span>
			<span className="min-w-0 truncate text-right">{value}</span>
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
	onRequestDelete: () => void;
}) {
	const {
		data: detail,
		isLoading,
		error,
		mutate,
	} = useSource(source?.id ?? null, source?.space_id ?? null);

	const ContentTypeIcon = source
		? CONTENT_TYPE_ICONS[source.content_type]
		: null;
	const errorMessage = source ? sourceErrorMessage(source.meta) : null;
	const metaEntries = Object.entries(source?.meta ?? {}).filter(
		([key]) => key !== "error_message",
	);

	return (
		<Sheet open={!!source} onOpenChange={onOpenChange}>
			<SheetContent className="data-[side=right]:sm:max-w-lg">
				{source && ContentTypeIcon && (
					<>
						<SheetHeader className="gap-1.5 pr-12">
							<SheetTitle className="flex items-start gap-2 text-left">
								<ContentTypeIcon className="size-4 shrink-0 translate-y-0.5 text-muted-foreground" />
								<span className="line-clamp-2 min-w-0">
									{sourceTitle(source)}
								</span>
							</SheetTitle>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<SourceStatus status={source.extraction_status} />
								<span aria-hidden>·</span>
								<span>{CONTENT_TYPE_LABELS[source.content_type]}</span>
							</div>
						</SheetHeader>
						<ScrollArea className="min-h-0 flex-1">
							<div className="flex flex-col gap-4 px-4 pb-4">
								<div className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
									<DetailRow
										label="Space"
										value={
											<Link
												href={`/spaces/${source.space_id}`}
												className="underline-offset-4 hover:underline"
											>
												{spaceName ?? "View space"}
											</Link>
										}
									/>
									<DetailRow
										label="Tokens"
										value={source.token_count.toLocaleString()}
									/>
									<DetailRow
										label="Created"
										value={formatDateTime(source.created_at)}
									/>
									<DetailRow
										label="Updated"
										value={formatDateTime(source.updated_at)}
									/>
								</div>
								{errorMessage && (
									<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
										{errorMessage}
									</div>
								)}
								{metaEntries.length > 0 && (
									<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
										{metaEntries.map(([key, value]) => (
											<span
												key={key}
												className="rounded bg-muted px-1.5 py-0.5"
											>
												{key}: {String(value)}
											</span>
										))}
									</div>
								)}
								<div className="flex flex-col gap-2">
									<span className="text-[0.68rem] font-semibold text-foreground/70 uppercase tracking-widest">
										Content
									</span>
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
									) : (
										<p className="whitespace-pre-wrap text-sm">
											{detail?.content}
										</p>
									)}
								</div>
							</div>
						</ScrollArea>
						<SheetFooter>
							<Button variant="destructive" onClick={onRequestDelete}>
								<IconTrash />
								Delete source
							</Button>
						</SheetFooter>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
