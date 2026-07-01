"use client";

import { useCallback, useRef } from "react";

// Lazily loads embed.js on first user intent; init runs at most once.
export function useCalApi() {
	const initialized = useRef(false);

	return useCallback(() => {
		if (initialized.current) return;
		initialized.current = true;
		void (async () => {
			const { getCalApi } = await import("@calcom/embed-react");
			const cal = await getCalApi({ namespace: "30min" });
			cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
		})();
	}, []);
}
