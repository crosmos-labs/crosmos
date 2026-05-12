"use client";

import { mutate } from "swr";
import { ApiKeyList } from "@/components/api-key-list";
import { ApiKeyListSkeleton } from "@/components/api-key-list-skeleton";
import { DataFetchError } from "@/components/data-fetch-error";
import { useApiKeys } from "@/hooks/use-api-keys";

export default function ApiKeyPage() {
	const { data: keys, isLoading, error } = useApiKeys();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
				<p className="text-sm text-muted-foreground">
					Manage your API keys for authenticating requests to the Crosmos API.
				</p>
			</div>
			{error ? (
				<DataFetchError
					message={error.message}
					onRetry={() => mutate("/api-keys")}
				/>
			) : isLoading && !keys ? (
				<ApiKeyListSkeleton />
			) : (
				<ApiKeyList keys={keys ?? []} />
			)}
		</div>
	);
}
