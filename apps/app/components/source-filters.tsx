"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crosmos/ui/components/popover";
import { Separator } from "@crosmos/ui/components/separator";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@crosmos/ui/components/sheet";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@crosmos/ui/components/toggle-group";
import { IconFilter, IconX } from "@tabler/icons-react";
import {
	CONTENT_TYPE_VALUES,
	EXTRACTION_STATUS_VALUES,
} from "@/lib/params/pagination";
import type { ContentTypeStr, ExtractionStatus } from "@/lib/types/source";
import type { Space } from "@/lib/types/space";

const CONTENT_TYPE_LABELS: Record<ContentTypeStr, string> = {
	text: "Text",
	markdown: "Markdown",
	pdf: "PDF",
	image: "Image",
	audio: "Audio",
	video: "Video",
	html: "HTML",
	json: "JSON",
};

const EXTRACTION_STATUS_LABELS: Record<ExtractionStatus, string> = {
	pending: "Pending",
	processing: "Processing",
	completed: "Extracted",
	failed: "Failed",
};

interface SourceFiltersProps {
	contentType: ContentTypeStr | null;
	extractionStatus: ExtractionStatus | null;
	spaceId: string | null;
	spaces: Space[];
	spacesLoading: boolean;
	onContentTypeChange: (value: ContentTypeStr | null) => void;
	onExtractionStatusChange: (value: ExtractionStatus | null) => void;
	onSpaceChange: (value: string | null) => void;
	onClearFilters: () => void;
}

function FilterSection({
	title,
	value,
	options,
	labels,
	onChange,
}: {
	title: string;
	value: string | null;
	options: readonly string[];
	labels: Record<string, string>;
	onChange: (value: string | null) => void;
}) {
	return (
		<div className="flex flex-col gap-2.5">
			<span className="text-[0.68rem] font-semibold text-foreground/70 uppercase tracking-widest">
				{title}
			</span>
			<ToggleGroup
				type="single"
				value={value ?? ""}
				onValueChange={(v) => {
					if (v) {
						onChange(v);
					} else if (value) {
						onChange(null);
					}
				}}
				className="flex flex-wrap gap-1 focus:outline-none"
			>
				{options.map((opt) => (
					<ToggleGroupItem
						key={opt}
						value={opt}
						size="sm"
						className="rounded-full border border-transparent px-2.5 text-xs text-muted-foreground focus:ring-0 focus-visible:ring-0 focus-visible:outline-none data-[state=on]:border-primary/30 data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:font-medium hover:text-foreground"
					>
						{labels[opt] ?? opt}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

function ClearButton({
	hasFilters,
	onClear,
	asChild,
}: {
	hasFilters: boolean;
	onClear: () => void;
	asChild?: boolean;
}) {
	if (!hasFilters) return null;
	const btn = (
		<Button
			variant="ghost"
			size="sm"
			className="gap-1.5 self-start text-muted-foreground focus:ring-0 focus-visible:ring-0"
			onClick={onClear}
		>
			<IconX className="size-3" />
			Clear filters
		</Button>
	);
	if (asChild) {
		return <SheetClose asChild>{btn}</SheetClose>;
	}
	return btn;
}

function TriggerButton({
	hasFilters,
	activeCount,
}: {
	hasFilters: boolean;
	activeCount: number;
}) {
	return (
		<Button variant="outline" size="sm" className="gap-1.5 rounded-full">
			<IconFilter className="size-3.5" />
			Filters
			{hasFilters && (
				<span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[0.6rem] font-medium text-background">
					{activeCount}
				</span>
			)}
		</Button>
	);
}

export function SourceFilters({
	contentType,
	extractionStatus,
	spaceId,
	spaces,
	spacesLoading,
	onContentTypeChange,
	onExtractionStatusChange,
	onSpaceChange,
	onClearFilters,
}: SourceFiltersProps) {
	const spaceLabels: Record<string, string> = {};
	const spaceIds: string[] = [];
	for (const space of spaces) {
		spaceLabels[space.id] = space.name;
		spaceIds.push(space.id);
	}

	const spaceVisible = !spacesLoading && spaceIds.length > 0;
	const hasFilters =
		contentType !== null ||
		extractionStatus !== null ||
		(spaceVisible && spaceId !== null);
	const activeCount =
		(contentType ? 1 : 0) +
		(extractionStatus ? 1 : 0) +
		(spaceVisible && spaceId ? 1 : 0);

	const filterContent = (
		<>
			{spaceVisible && (
				<FilterSection
					title="Space"
					value={spaceId}
					options={spaceIds}
					labels={spaceLabels}
					onChange={(v) => onSpaceChange(v)}
				/>
			)}
			<FilterSection
				title="Content type"
				value={contentType}
				options={CONTENT_TYPE_VALUES}
				labels={CONTENT_TYPE_LABELS}
				onChange={(v) => onContentTypeChange(v as ContentTypeStr | null)}
			/>
			<FilterSection
				title="Status"
				value={extractionStatus}
				options={EXTRACTION_STATUS_VALUES}
				labels={EXTRACTION_STATUS_LABELS}
				onChange={(v) => onExtractionStatusChange(v as ExtractionStatus | null)}
			/>
			<Separator />
			<ClearButton hasFilters={hasFilters} onClear={onClearFilters} />
		</>
	);

	return (
		<>
			<div className="hidden md:block">
				<Popover>
					<PopoverTrigger asChild>
						<div>
							<TriggerButton
								hasFilters={hasFilters}
								activeCount={activeCount}
							/>
						</div>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-80">
						{filterContent}
					</PopoverContent>
				</Popover>
			</div>
			<div className="md:hidden">
				<Sheet>
					<SheetTrigger asChild>
						<div>
							<TriggerButton
								hasFilters={hasFilters}
								activeCount={activeCount}
							/>
						</div>
					</SheetTrigger>
					<SheetContent side="bottom" className="rounded-t-xl">
						<SheetHeader>
							<SheetTitle>Filter sources</SheetTitle>
						</SheetHeader>
						<div className="flex flex-col gap-4 px-4 pb-4">{filterContent}</div>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}
