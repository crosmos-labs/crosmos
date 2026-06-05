"use client";

import { useCallback, useRef } from "react";

/**
 * Lazily initialises the Cal.com embed. Returns a trigger to call on the first
 * user intent (hover / focus / pointer-down) on a booking CTA — so the embed
 * SDK and `embed.js` are only fetched when someone is about to book, instead of
 * on every page load. Initialisation runs at most once.
 */
export function useCalApi() {
	const initialized = useRef(false);

	return useCallback(() => {
		if (initialized.current) return;
		initialized.current = true;
		void (async () => {
			const { getCalApi } = await import("@calcom/embed-react");
			const cal = await getCalApi({ namespace: "15min" });
			cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
		})();
	}, []);
}
