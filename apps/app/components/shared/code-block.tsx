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
		<div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-lg border bg-muted/50 p-3 pl-4">
			<div className="absolute top-2 right-2 z-10 rounded-md bg-muted/50">
				<CopyButton value={value} />
			</div>
			<pre
				className={
					className ?? "text-sm font-mono whitespace-pre overflow-x-auto pr-12"
				}
			>
				{children ?? value}
			</pre>
		</div>
	);
}
