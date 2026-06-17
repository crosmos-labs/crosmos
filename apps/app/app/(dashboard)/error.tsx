"use client";

import { DataFetchError } from "@/components/shared/data-fetch-error";

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const message =
		error instanceof Error ? error.message : "Something went wrong";

	return (
		<DataFetchError
			message={message}
			onRetry={async () => {
				reset();
			}}
		/>
	);
}
