"use client";

import { memo } from "react";
import { Streamdown } from "streamdown";

/**
 * Assistant message renderer: streaming-safe Markdown (code blocks, lists,
 * tables) with Streamdown's built-in per-word "blurIn" animation, which masks
 * the batched token arrivals from smoothStream. When `isStreaming` is false the
 * animation plugin is dropped entirely, so finished messages carry no extra DOM.
 */
export const ChatResponse = memo(function ChatResponse({
	text,
	isStreaming,
}: {
	text: string;
	isStreaming: boolean;
}) {
	return (
		<Streamdown
			animated={{
				animation: "slideUp",
				sep: "char",
				duration: 200,
				easing: "ease-out",
			}}
			isAnimating={isStreaming}
			className="max-w-none break-words text-base leading-relaxed"
		>
			{text}
		</Streamdown>
	);
});
