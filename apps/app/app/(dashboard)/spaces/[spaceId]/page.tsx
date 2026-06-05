"use client";

import { useQueryStates } from "nuqs";
import { use, useEffect } from "react";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { MemoryList } from "@/components/memory-list";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { SpaceDetailSkeleton } from "@/components/space-detail-skeleton";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { memoriesKey, useMemories } from "@/hooks/use-memories";
import { spacesKey, useSpaces } from "@/hooks/use-spaces";
import { paginationParsers } from "@/lib/params/pagination";

export default function SpaceDetailPage({
	params,
}: {
	params: Promise<{ spaceId: string }>;
}) {
	const { spaceId } = use(params);
	const orgId = useActiveOrgId();
	const {
		data: spaces,
		isLoading: spacesLoading,
		error: spacesError,
	} = useSpaces();
	const [queryParams, setQueryParams] = useQueryStates(paginationParsers);
	const page = queryParams.page;
	const space = spaces?.find((s) => s.id === spaceId);
	const {
		data: memoriesData,
		isLoading: memoriesLoading,
		error: memoriesError,
	} = useMemories(space ? spaceId : "", page);

	const { setBreadcrumb } = useBreadcrumb();
	const { mutate } = useSWRConfig();
	const spacesSwrKey = orgId ? spacesKey(orgId) : null;
	const memoriesSwrKey = orgId ? memoriesKey(orgId, spaceId, page) : null;

	useEffect(() => {
		if (space) {
			setBreadcrumb({
				label: space.name,
				parent: { label: "Spaces", href: "/spaces" },
			});
		}
		return () => setBreadcrumb(null);
	}, [space, setBreadcrumb]);

	const hasMore = memoriesData?.hasMore ?? false;
	const memories = memoriesData?.memories ?? [];

	const isInitialLoading =
		(spacesLoading && !spaces) || (memoriesLoading && !memoriesData);

	if (spacesError) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						Space Details
					</h1>
					<p className="text-sm text-muted-foreground">Loading space…</p>
				</div>
				<DataFetchError
					message={spacesError.message}
					onRetry={() =>
						spacesSwrKey ? mutate(spacesSwrKey) : Promise.resolve()
					}
				/>
			</div>
		);
	}

	if (!orgId || isInitialLoading) {
		return <SpaceDetailSkeleton />;
	}

	if (!space) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						Space Not Found
					</h1>
					<p className="text-sm text-muted-foreground">
						This space may have been deleted.
					</p>
				</div>
				<DataFetchError
					message="Space not found"
					onRetry={() =>
						spacesSwrKey ? mutate(spacesSwrKey) : Promise.resolve()
					}
				/>
			</div>
		);
	}

	if (memoriesError) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						{space?.name}
					</h1>
					<p className="text-sm text-muted-foreground">
						{space?.description ?? "No description"}
					</p>
				</div>
				<DataFetchError
					message={memoriesError.message}
					onRetry={() =>
						memoriesSwrKey ? mutate(memoriesSwrKey) : Promise.resolve()
					}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">{space?.name}</h1>
				<p className="text-sm text-muted-foreground">
					{space?.description ?? "No description"}
				</p>
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold tracking-tight">Memories</h2>
				</div>
				<MemoryList
					memories={memories}
					spaceUuid={spaceId}
					page={page}
					hasMore={hasMore}
					swrKey={memoriesSwrKey ?? ""}
					onPageChange={(newPage) => setQueryParams({ page: newPage })}
				/>
			</div>
		</div>
	);
}
