"use client";

import { SWRConfig } from "swr";

export function SwrProvider({ children }: { children: React.ReactNode }) {
	return (
		<SWRConfig
			value={{
				dedupingInterval: 5000,
				errorRetryCount: 3,
			}}
		>
			{children}
		</SWRConfig>
	);
}
