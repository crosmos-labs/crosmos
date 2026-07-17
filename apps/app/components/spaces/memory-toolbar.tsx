"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	IconArrowsSort,
	IconBrain,
	IconSortAscending,
	IconSortDescending,
	IconX,
} from "@tabler/icons-react";
import { FilterPopover } from "@/components/sources/source-filter-popover";
import { MEMORY_TYPE_ICONS, MEMORY_TYPE_LABELS } from "@/lib/memory-labels";
import { MEMORY_TYPE_VALUES } from "@/lib/params/pagination";
import type { MemoryType, RecallSort } from "@/lib/types/memory";

const MEMORY_TYPE_OPTIONS = MEMORY_TYPE_VALUES.map((value) => {
	const Icon = MEMORY_TYPE_ICONS[value];
	return {
		value,
		label: MEMORY_TYPE_LABELS[value],
		icon: <Icon className="text-muted-foreground" />,
	};
});

const RECALL_SORT_OPTIONS = [
	{
		value: "most",
		label: "Most recalled",
		icon: <IconSortDescending className="text-muted-foreground" />,
	},
	{
		value: "least",
		label: "Least recalled",
		icon: <IconSortAscending className="text-muted-foreground" />,
	},
];

export function MemoryToolbar({
	memoryType,
	recallSort,
	onMemoryTypeChange,
	onRecallSortChange,
	onReset,
}: {
	memoryType: MemoryType | null;
	recallSort: RecallSort | null;
	onMemoryTypeChange: (value: MemoryType | null) => void;
	onRecallSortChange: (value: RecallSort | null) => void;
	onReset: () => void;
}) {
	const hasControls = memoryType !== null || recallSort !== null;

	return (
		<div className="flex flex-wrap items-center gap-2">
			<FilterPopover
				label="Memory type"
				icon={IconBrain}
				options={MEMORY_TYPE_OPTIONS}
				value={memoryType}
				onSelect={(value) => onMemoryTypeChange(value as MemoryType | null)}
			/>
			<FilterPopover
				label="Recall sort"
				icon={IconArrowsSort}
				options={RECALL_SORT_OPTIONS}
				value={recallSort}
				onSelect={(value) => onRecallSortChange(value as RecallSort | null)}
			/>
			{hasControls && (
				<Button variant="ghost" onClick={onReset}>
					<IconX />
					Clear
				</Button>
			)}
		</div>
	);
}
