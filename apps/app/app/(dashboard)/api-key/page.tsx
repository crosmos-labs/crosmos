"use client";

import { mutate } from "swr";
import { ApiKeyList } from "@/components/api-key-list";
import { ApiKeyListSkeleton } from "@/components/api-key-list-skeleton";
import { DataFetchError } from "@/components/data-fetch-error";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { apiKeysKey, useApiKeys } from "@/hooks/use-api-keys";

export default function ApiKeyPage() {
	const orgId = useActiveOrgId();
	const { data: keys, isLoading, error } = useApiKeys();
	const swrKey = orgId ? apiKeysKey(orgId) : null;

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
					onRetry={() => (swrKey ? mutate(swrKey) : Promise.resolve())}
				/>
			) : !orgId || (isLoading && !keys) ? (
				<ApiKeyListSkeleton />
			) : swrKey ? (
				<ApiKeyList keys={keys ?? []} swrKey={swrKey} />
			) : (
				<ApiKeyListSkeleton />
			)}
		</div>
	);
}
