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
	const activeItem = items.find((i) => i.value === active) ?? null;

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setActive("");
			}}
		>
			<PopoverTrigger asChild>
				<Button variant="outline" disabled={disabled}>
					<IconPlus />
					{triggerLabel}
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="gap-0 overflow-hidden p-0 w-80">
				<Command value={active} onValueChange={setActive}>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyLabel}</CommandEmpty>
						<CommandGroup>
							{items.map((item) => (
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
