"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { useQueryStates } from "nuqs";
import { use, useEffect } from "react";
import { useSWRConfig } from "swr";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import {
	MemoryList,
	MemoryListSkeleton,
	SpaceDetailSkeleton,
} from "@/components/spaces/memory-list";
import { MemoryToolbar } from "@/components/spaces/memory-toolbar";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { memoriesKey, useMemories } from "@/hooks/use-memories";
import { spacesKey, useSpaces } from "@/hooks/use-spaces";
import { memoryPaginationParsers } from "@/lib/params/pagination";

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
	const [queryParams, setQueryParams] = useQueryStates(
		memoryPaginationParsers,
		{
			history: "push",
		},
	);
	const page = Math.max(1, queryParams.page);
	const filters = {
		memory_type: queryParams.memory_type,
		recall_sort: queryParams.recall_sort,
	};
	const space = spaces?.find((s) => s.id === spaceId);
	const {
		data: memoriesData,
		isLoading: memoriesLoading,
		error: memoriesError,
	} = useMemories(space ? spaceId : "", page, filters);

	const { setBreadcrumb } = useBreadcrumb();
	const { mutate } = useSWRConfig();
	const spacesSwrKey = orgId ? spacesKey(orgId) : null;
	const memoriesSwrKey = orgId
		? memoriesKey(orgId, spaceId, page, filters)
		: null;

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
	const hasFilters =
		filters.memory_type !== null || filters.recall_sort !== null;
	const clearFilters = () => setQueryParams(null);

	const isInitialLoading = spacesLoading && !spaces;

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

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">{space.name}</h1>
				{space.description && (
					<p className="text-sm text-muted-foreground">{space.description}</p>
				)}
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<h2 className="text-lg font-semibold tracking-tight">Memories</h2>
					<p className="text-sm text-muted-foreground">
						Facts crosmos has learned from sources in this space.
					</p>
				</div>
				<MemoryToolbar
					memoryType={filters.memory_type}
					recallSort={filters.recall_sort}
					onMemoryTypeChange={(value) =>
						setQueryParams({ memory_type: value, page: null })
					}
					onRecallSortChange={(value) =>
						setQueryParams({ recall_sort: value, page: null })
					}
					onReset={clearFilters}
				/>
				{memoriesError ? (
					<DataFetchError
						message={memoriesError.message}
						onRetry={() =>
							memoriesSwrKey ? mutate(memoriesSwrKey) : Promise.resolve()
						}
					/>
				) : !memoriesSwrKey || !memoriesData ? (
					<MemoryListSkeleton />
				) : (
					<div
						aria-busy={memoriesLoading}
						className={cn(
							"transition-opacity",
							memoriesLoading && "opacity-60",
						)}
					>
						<MemoryList
							memories={memories}
							spaceUuid={spaceId}
							page={page}
							hasMore={hasMore}
							hasFilters={hasFilters}
							swrKey={memoriesSwrKey}
							onPageChange={(newPage) => setQueryParams({ page: newPage })}
							onClearFilters={clearFilters}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
