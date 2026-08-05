"use client";

import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { SpaceList, SpacesListSkeleton } from "@/components/spaces/space-list";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { spacesKey, useSpaces } from "@/hooks/use-spaces";

export default function SpacesPage() {
	const { mutate } = useSWRConfig();
	const orgId = useActiveOrgId();
	const { data: spaces, isLoading, error } = useSpaces();
	const swrKey = orgId ? spacesKey(orgId) : null;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
				<p className="text-sm text-muted-foreground">
					Create spaces to organize memory. Select a space to browse the
					memories crosmos has learned from its sources.
				</p>
			</div>
			{error ? (
				<DataFetchError
					message={error.message}
					onRetry={() => (swrKey ? mutate(swrKey) : Promise.resolve())}
				/>
			) : !orgId || (isLoading && !spaces) ? (
				<SpacesListSkeleton />
			) : swrKey ? (
				<SpaceList spaces={spaces ?? []} orgId={orgId} swrKey={swrKey} />
			) : (
				<SpacesListSkeleton />
			)}
		</div>
	);
}
