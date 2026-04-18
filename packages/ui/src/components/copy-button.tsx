"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./button";

const COPY_RESET_MS = 2000;

export function CopyButton({
	value,
	className,
}: {
	value: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

	const handleCopy = useCallback(async () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			timerRef.current = setTimeout(() => setCopied(false), COPY_RESET_MS);
		} catch {}
	}, [value]);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	return (
		<Button
			variant="ghost"
			size="icon-sm"
			className={cn(
				"relative hover:!bg-transparent disabled:opacity-100",
				className,
			)}
			onClick={handleCopy}
			aria-label={copied ? "Copied" : "Copy to clipboard"}
			disabled={copied}
		>
			<div
				className={cn(
					"transition-all",
					copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
				)}
			>
				<IconCheck
					className="stroke-emerald-500"
					size={14}
					strokeWidth={2}
					aria-hidden="true"
				/>
			</div>
			<div
				className={cn(
					"absolute transition-all",
					copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
				)}
			>
				<IconCopy size={14} strokeWidth={2} aria-hidden="true" />
			</div>
		</Button>
	);
}
