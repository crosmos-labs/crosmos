"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";

type RFGComponent = ComponentType<Record<string, unknown>>;

let cached: RFGComponent | null = null;
let pending: Promise<RFGComponent> | null = null;

function loadOnce(): Promise<RFGComponent> {
	if (cached) return Promise.resolve(cached);
	if (pending) return pending;
	pending = import("react-force-graph-2d").then(
		(mod) => {
			cached = mod.default as unknown as RFGComponent;
			return cached;
		},
		(err) => {
			pending = null;
			throw err;
		},
	);
	return pending;
}

export function useForceGraph2D(): RFGComponent | null {
	const [Comp, setComp] = useState<RFGComponent | null>(cached);
	useEffect(() => {
		if (cached) {
			setComp(() => cached);
			return;
		}
		let cancelled = false;
		loadOnce()
			.then((C) => {
				if (!cancelled) setComp(() => C);
			})
			.catch((err) => {
				if (!cancelled)
					console.error("Failed to load react-force-graph-2d", err);
			});
		return () => {
			cancelled = true;
		};
	}, []);
	return Comp;
}
