"use client";

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
	PopoverAnchor,
	PopoverContent,
} from "@crosmos/ui/components/popover";
import { cn } from "@crosmos/ui/lib/utils";
import { IconX } from "@tabler/icons-react";
import { type ComponentType, type ReactNode, useRef, useState } from "react";

export interface FilterOption {
	value: string;
	label: string;
	icon?: ReactNode;
}

const segmentClasses =
	"flex h-full cursor-pointer items-center gap-1.5 px-2.5 text-sm transition-colors outline-none hover:bg-muted hover:text-foreground hover:transition-none focus-visible:bg-muted";

export function FilterPopover({
	label,
	icon: Icon,
	options,
	value,
	onSelect,
	searchable,
	searchPlaceholder,
	emptyLabel,
}: {
	label: string;
	icon: ComponentType<{ className?: string }>;
	options: FilterOption[];
	value: string | null;
	onSelect: (value: string | null) => void;
	searchable?: boolean;
	searchPlaceholder?: string;
	emptyLabel?: string;
}) {
	const [open, setOpen] = useState(false);
	const pillRef = useRef<HTMLDivElement>(null);
	const activeLabel =
		value === null
			? null
			: (options.find((option) => option.value === value)?.label ?? "Unknown");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverAnchor asChild>
				<div
					ref={pillRef}
					className={cn(
						"flex h-8 items-stretch overflow-hidden rounded-lg",
						activeLabel !== null && "bg-muted/50",
					)}
				>
					<button
						type="button"
						onClick={() => setOpen(!open)}
						className={cn(
							segmentClasses,
							activeLabel === null
								? "rounded-lg text-muted-foreground"
								: "font-medium text-foreground",
						)}
					>
						<Icon className="size-4 text-muted-foreground" />
						{label}
					</button>
					{activeLabel !== null && (
						<>
							<button
								type="button"
								onClick={() => setOpen(!open)}
								className={cn(segmentClasses, "border-l")}
							>
								{activeLabel}
							</button>
							<button
								type="button"
								aria-label={`Clear ${label} filter`}
								onClick={() => {
									onSelect(null);
									setOpen(false);
								}}
								className={cn(
									segmentClasses,
									"border-l px-2 text-muted-foreground",
								)}
							>
								<IconX className="size-3.5" />
							</button>
						</>
					)}
				</div>
			</PopoverAnchor>
			<PopoverContent
				align="start"
				className="w-fit min-w-44 p-0"
				onInteractOutside={(event) => {
					if (pillRef.current?.contains(event.target as Node)) {
						event.preventDefault();
					}
				}}
			>
				<Command>
					{searchable && <CommandInput placeholder={searchPlaceholder} />}
					<CommandList>
						<CommandEmpty>{emptyLabel ?? "No results."}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.label}
									data-checked={option.value === value}
									onSelect={() => {
										onSelect(option.value === value ? null : option.value);
										setOpen(false);
									}}
								>
									{option.icon}
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
