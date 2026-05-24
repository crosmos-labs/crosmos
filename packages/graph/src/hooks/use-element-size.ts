"use client";

import { type RefObject, useEffect, useState } from "react";

export interface ElementSize {
	width: number;
	height: number;
}

export function useElementSize(
	ref: RefObject<HTMLElement | null>,
	initial: ElementSize = { width: 800, height: 600 },
): ElementSize {
	const [size, setSize] = useState<ElementSize>(initial);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			setSize({
				width: entry.contentRect.width,
				height: entry.contentRect.height,
			});
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [ref]);

	return size;
}
