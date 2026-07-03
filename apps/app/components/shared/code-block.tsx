import { CopyButton } from "@crosmos/ui/components/copy-button";
import type { ReactNode } from "react";

export function CodeBlock({
	value,
	children,
	className,
}: {
	value: string;
	children?: ReactNode;
	className?: string;
}) {
	return (
		<div className="relative rounded-lg border bg-muted/50 p-3 pl-4">
			<div className="absolute top-2 right-2">
				<CopyButton value={value} />
			</div>
			<pre
				className={
					className ?? "text-sm font-mono whitespace-pre overflow-x-auto pr-8"
				}
			>
				{children ?? value}
			</pre>
		</div>
	);
}
