"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	IconCircleDashed,
	IconDatabase,
	IconFileDescription,
	IconX,
} from "@tabler/icons-react";
import { FilterPopover } from "@/components/sources/source-filter-popover";
import { SourceStatusDot } from "@/components/sources/source-status";
import {
	CONTENT_TYPE_VALUES,
	EXTRACTION_STATUS_VALUES,
} from "@/lib/params/pagination";
import {
	CONTENT_TYPE_ICONS,
	CONTENT_TYPE_LABELS,
	EXTRACTION_STATUS_LABELS,
} from "@/lib/source-labels";
import type { ContentTypeStr, ExtractionStatus } from "@/lib/types/source";
import type { Space } from "@/lib/types/space";

const CONTENT_TYPE_OPTIONS = CONTENT_TYPE_VALUES.map((value) => {
	const Icon = CONTENT_TYPE_ICONS[value];
	return {
		value,
		label: CONTENT_TYPE_LABELS[value],
		icon: <Icon className="text-muted-foreground" />,
	};
});

const EXTRACTION_STATUS_OPTIONS = EXTRACTION_STATUS_VALUES.map((value) => ({
	value,
	label: EXTRACTION_STATUS_LABELS[value],
	icon: (
		<span className="flex size-4 items-center justify-center">
			<SourceStatusDot status={value} />
		</span>
	),
}));

interface SourceToolbarProps {
	contentType: ContentTypeStr | null;
	extractionStatus: ExtractionStatus | null;
	spaceId: string | null;
	spaces: Space[];
	spacesLoading: boolean;
	onContentTypeChange: (value: ContentTypeStr | null) => void;
	onExtractionStatusChange: (value: ExtractionStatus | null) => void;
	onSpaceChange: (value: string | null) => void;
	onReset: () => void;
}

export function SourceToolbar({
	contentType,
	extractionStatus,
	spaceId,
	spaces,
	spacesLoading,
	onContentTypeChange,
	onExtractionStatusChange,
	onSpaceChange,
	onReset,
}: SourceToolbarProps) {
	// Keep the pill visible for an active space_id even while spaces load, so
	// a stale URL filter can always be seen and cleared.
	const showSpaceFilter =
		spaceId !== null || (!spacesLoading && spaces.length > 0);
	const hasFilters =
		contentType !== null || extractionStatus !== null || spaceId !== null;

	return (
		<div className="flex flex-wrap items-center gap-2">
			{showSpaceFilter && (
				<FilterPopover
					label="Space"
					icon={IconDatabase}
					options={spaces.map((space) => ({
						value: space.id,
						label: space.name,
						icon: <IconDatabase className="text-muted-foreground" />,
					}))}
					value={spaceId}
					onSelect={onSpaceChange}
					searchable
					searchPlaceholder="Search spaces…"
					emptyLabel="No spaces found."
				/>
			)}
			<FilterPopover
				label="Type"
				icon={IconFileDescription}
				options={CONTENT_TYPE_OPTIONS}
				value={contentType}
				onSelect={(value) =>
					onContentTypeChange(value as ContentTypeStr | null)
				}
			/>
			<FilterPopover
				label="Status"
				icon={IconCircleDashed}
				options={EXTRACTION_STATUS_OPTIONS}
				value={extractionStatus}
				onSelect={(value) =>
					onExtractionStatusChange(value as ExtractionStatus | null)
				}
			/>
			{hasFilters && (
				<Button variant="ghost" onClick={onReset}>
					<IconX />
					Clear
				</Button>
			)}
		</div>
	);
}
