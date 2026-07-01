"use client";

import { useCallback, useRef } from "react";

// Lazily loads embed.js on first user intent; cleared on failure so it retries.
export function useCalApi(namespace: string) {
	const initPromise = useRef<Promise<void> | null>(null);

	return useCallback(() => {
		if (initPromise.current) return;
		initPromise.current = (async () => {
			const { getCalApi } = await import("@calcom/embed-react");
			const cal = await getCalApi({ namespace });
			cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
		})().catch((err) => {
			initPromise.current = null;
			console.error("Cal embed failed to load", err);
		});
	}, [namespace]);
}
