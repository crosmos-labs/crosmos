"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { mutate } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { useApiKeys } from "@/hooks/use-api-keys";
import { ApiKeyList } from "@/components/api-key-list";

export default function ApiKeyPage() {
	const { data: keys, isLoading, error } = useApiKeys();

	if (isLoading) {
		return <AnimatedSpinner name="waverows" size="1.5rem" />;
	}

	if (error) {
		return (
			<DataFetchError
				message={error.message}
				onRetry={() => mutate("/api-keys")}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
				<p className="text-sm text-muted-foreground">
					Manage your API keys for authenticating requests to the Crosmos API.
				</p>
			</div>
			<ApiKeyList keys={keys ?? []} />
		</div>
	);
}