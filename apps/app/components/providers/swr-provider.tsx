"use client";

import { SWRConfig } from "swr";

export function SwrProvider({
	children,
	fallback,
}: {
	children: React.ReactNode;
	fallback?: Record<string, unknown>;
}) {
	return (
		<SWRConfig
			value={{
				dedupingInterval: 5000,
				errorRetryCount: 3,
				revalidateOnFocus: true,
				revalidateOnReconnect: true,
				...(fallback ? { fallback } : {}),
			}}
		>
			{children}
		</SWRConfig>
	);
}
