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
				// Never retry 4xx — a 429 (rate limit) or client error won't pass on
				// retry, and retrying a 429 only deepens the backoff window.
				onErrorRetry: (error, _key, config, revalidate, { retryCount }) => {
					const status = (error as { status?: number } | undefined)?.status;
					if (typeof status === "number" && status >= 400 && status < 500) {
						return;
					}
					if (retryCount >= (config.errorRetryCount ?? 3)) return;
					setTimeout(
						() => revalidate({ retryCount }),
						(config.errorRetryInterval ?? 5000) * 2 ** retryCount,
					);
				},
				...(fallback ? { fallback } : {}),
			}}
		>
			{children}
		</SWRConfig>
	);
}
