import { ItemDescription } from "@crosmos/ui/components/item";
import type { ReactNode } from "react";

export function HoverMeta({
	base,
	hover,
}: {
	base: ReactNode;
	hover: ReactNode;
}) {
	return (
		<ItemDescription as="div" className="grid">
			<span className="col-start-1 row-start-1 transition-opacity duration-100 group-hover/item:opacity-0 group-hover/item:transition-none">
				{base}
			</span>
			<span className="col-start-1 row-start-1 opacity-0 transition-opacity duration-100 group-hover/item:opacity-100 group-hover/item:transition-none">
				{hover}
			</span>
		</ItemDescription>
	);
}
