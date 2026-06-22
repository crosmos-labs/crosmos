"use client";

import { Button } from "@crosmos/ui/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crosmos/ui/components/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crosmos/ui/components/popover";
import { IconPlus } from "@tabler/icons-react";
import { type ReactNode, useState } from "react";

const MAX_RESULTS = 50;

export interface PickerItem {
	id: string;
	value: string;
	leading?: ReactNode;
	label: string;
	trailing?: ReactNode;
	disabled?: boolean;
}

export function EntityPickerPopover({
	triggerLabel,
	searchPlaceholder,
	emptyLabel,
	items,
	disabled,
	onSelect,
	footer,
}: {
	triggerLabel: string;
	searchPlaceholder: string;
	emptyLabel: string;
	items: PickerItem[];
	disabled?: boolean;
	onSelect: (id: string) => void;
	footer?: (activeItem: PickerItem | null) => ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState("");
	const [query, setQuery] = useState("");
	const activeItem = items.find((i) => i.value === active) ?? null;

	// Own the filtering so the rendered list can be capped (cap is applied AFTER
	// filtering, so search still covers every item).
	const q = query.trim().toLowerCase();
	const matched = q
		? items.filter((i) => i.value.toLowerCase().includes(q))
		: items;
	const shown = matched.slice(0, MAX_RESULTS);
	const hidden = matched.length - shown.length;

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) {
					setActive("");
					setQuery("");
				}
			}}
		>
			<PopoverTrigger asChild>
				<Button variant="default" disabled={disabled}>
					<IconPlus />
					{triggerLabel}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:w-80"
			>
				<Command shouldFilter={false} value={active} onValueChange={setActive}>
					<CommandInput
						placeholder={searchPlaceholder}
						value={query}
						onValueChange={setQuery}
					/>
					<CommandList>
						<CommandEmpty>{emptyLabel}</CommandEmpty>
						<CommandGroup>
							{shown.map((item) => (
								<CommandItem
									key={item.id}
									value={item.value}
									disabled={item.disabled}
									onSelect={() => {
										onSelect(item.id);
										setOpen(false);
									}}
									className="[&>svg:last-child]:hidden"
								>
									{item.leading}
									<span className="flex-1 truncate">{item.label}</span>
									{item.trailing}
								</CommandItem>
							))}
						</CommandGroup>
						{hidden > 0 && (
							<div className="px-3 py-2 text-center text-xs text-muted-foreground">
								Showing {MAX_RESULTS} of {matched.length} — type to narrow
							</div>
						)}
					</CommandList>
				</Command>
				{footer && (
					<div className="border-t bg-muted/50 px-3 py-4 text-xs text-muted-foreground">
						{footer(activeItem)}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
