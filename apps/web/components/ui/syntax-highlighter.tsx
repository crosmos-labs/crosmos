"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useDecryptAnimation } from "@/hooks/use-decrypt-animation";
import { getHighlightedChars } from "@/lib/syntax-highlighter";

interface DecryptCodeSnippetProps {
	codeLines: string[];
	language: string;
	className?: string;
}

export function DecryptCodeSnippet({
	codeLines,
	language,
	className,
}: DecryptCodeSnippetProps) {
	const { containerRef, displayGrid } = useDecryptAnimation(codeLines);

	const targetColors = useMemo(() => {
		return getHighlightedChars(codeLines, language);
	}, [codeLines, language]);

	const [maxLines, setMaxLines] = useState(codeLines.length);

	useEffect(() => {
		if (codeLines.length > maxLines) {
			setMaxLines(codeLines.length);
		}
	}, [codeLines.length, maxLines]);

	return (
		<div
			className={cn(
				"relative w-full h-full font-mono text-[clamp(11px,0.7vw,13px)] leading-relaxed overflow-hidden",
				className,
			)}
		>
			<div className="px-4 pb-4 pt-4 sm:px-8 sm:pb-10 sm:pt-6 overflow-x-auto">
				<pre
					ref={containerRef}
					className="m-0 p-0 bg-transparent border-none text-[#abb2bf]"
					style={{ minHeight: `${maxLines * 1.625}em` }}
				>
					{displayGrid.map((line: string[], lIdx: number) => {
						const colors = targetColors[lIdx] || [];
						return (
							<div key={`line-${lIdx}`} className="table-row">
								{line.length === 0 ? (
									<span className="whitespace-pre"> </span>
								) : (
									line.map((char: string, cIdx: number) => (
										<span
											key={`char-${lIdx}-${cIdx}`}
											data-l={lIdx}
											data-c={cIdx}
											className={cn(
												"whitespace-pre",
												colors[cIdx] || "text-[#abb2bf]",
											)}
										>
											{char}
										</span>
									))
								)}
							</div>
						);
					})}
				</pre>
			</div>
		</div>
	);
}
