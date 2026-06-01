"use client";

import { CopyButton } from "@crosmos/ui/components/copy-button";
import { memo } from "react";
import { Streamdown } from "streamdown";

/** Full-width fenced code block with language label + copy button. */
function CodeBlock({
	children,
	className,
}: React.ComponentProps<"code"> & { node?: unknown }) {
	const code = String(children ?? "").trimEnd();
	const language = className?.replace("language-", "") ?? "";

	return (
		<div className="my-3 w-full overflow-hidden rounded-xl border border-border bg-muted/40">
			<div className="flex items-center justify-between border-b border-border px-4 py-2">
				<span className="font-mono text-xs text-muted-foreground">
					{language || "code"}
				</span>
				<CopyButton value={code} />
			</div>
			<pre className="overflow-x-auto px-4 py-3">
				<code className="font-mono text-sm leading-relaxed">{children}</code>
			</pre>
		</div>
	);
}

/** Inline code — short spans inside prose. */
function InlineCode({
	children,
}: React.ComponentProps<"code"> & { node?: unknown }) {
	return (
		<code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">
			{children}
		</code>
	);
}

export const ChatResponse = memo(function ChatResponse({
	text,
}: {
	text: string;
}) {
	return (
		<Streamdown
			className="max-w-none break-words text-base leading-relaxed"
			components={{ code: CodeBlock, inlineCode: InlineCode }}
		>
			{text}
		</Streamdown>
	);
});
