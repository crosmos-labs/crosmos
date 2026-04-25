"use client";

import { DataFetchError } from "@/components/data-fetch-error";

export default function DashboardError({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const message =
		error instanceof Error ? error.message : "Something went wrong";

	return (
		<DataFetchError
			message={message}
			onRetry={() =>
				new Promise(() => {
					window.location.reload();
				})
			}
		/>
	);
}
