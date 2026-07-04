"use client";

import { cn } from "@crosmos/ui/lib/utils";
import { useQueryStates } from "nuqs";
import { Suspense, useMemo } from "react";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import {
	SourceList,
	SourceListSkeleton,
} from "@/components/sources/source-list";
import { SourceToolbar } from "@/components/sources/source-toolbar";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { buildSourcesKey, useSources } from "@/hooks/use-sources";
import { useSpaces } from "@/hooks/use-spaces";
import { paginationParsers } from "@/lib/params/pagination";

function PageHeader() {
	return (
		<div className="flex flex-col gap-1">
			<h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
			<p className="text-sm text-muted-foreground">
				All sources ingested across your spaces.
			</p>
		</div>
	);
}

// useQueryStates reads useSearchParams, so the static /sources route must
// render it inside a Suspense boundary to prerender.
export default function SourcesPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col gap-6">
					<PageHeader />
					<SourceListSkeleton />
				</div>
			}
		>
			<SourcesPageContent />
		</Suspense>
	);
}

function SourcesPageContent() {
	const orgId = useActiveOrgId();
	const [params, setParams] = useQueryStates(paginationParsers);
	const page = Math.max(1, params.page);
	const filters = {
		content_type: params.content_type,
		extraction_status: params.extraction_status,
		space_id: params.space_id,
	};

	const {
		data: sourcesData,
		isLoading,
		error: sourcesError,
	} = useSources(page, filters);
	const { data: spacesData, isLoading: spacesLoading } = useSpaces();
	const { mutate } = useSWRConfig();

	const spaceNameLookup = useMemo(() => {
		const map = new Map<string, string>();
		for (const space of spacesData ?? []) {
			map.set(space.id, space.name);
		}
		return map;
	}, [spacesData]);

	const hasFilters =
		filters.content_type !== null ||
		filters.extraction_status !== null ||
		filters.space_id !== null;
	const swrKey = orgId ? buildSourcesKey(orgId, page, filters) : null;
	const clearFilters = () => setParams(null);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader />
			{sourcesError ? (
				<DataFetchError
					message={sourcesError.message}
					onRetry={() => (swrKey ? mutate(swrKey) : Promise.resolve())}
				/>
			) : (
				<>
					{orgId && (
						<SourceToolbar
							contentType={filters.content_type}
							extractionStatus={filters.extraction_status}
							spaceId={filters.space_id}
							spaces={spacesData ?? []}
							spacesLoading={spacesLoading}
							onContentTypeChange={(value) =>
								setParams({ content_type: value, page: null })
							}
							onExtractionStatusChange={(value) =>
								setParams({ extraction_status: value, page: null })
							}
							onSpaceChange={(value) =>
								setParams({ space_id: value, page: null })
							}
							onReset={clearFilters}
						/>
					)}
					{!swrKey || !sourcesData ? (
						<SourceListSkeleton />
					) : (
						<div
							aria-busy={isLoading}
							className={cn("transition-opacity", isLoading && "opacity-60")}
						>
							<SourceList
								sources={sourcesData.sources}
								page={page}
								hasMore={sourcesData.hasMore}
								hasFilters={hasFilters}
								swrKey={swrKey}
								spaceNameLookup={spaceNameLookup}
								onPageChange={(newPage) => setParams({ page: newPage })}
								onClearFilters={clearFilters}
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
}
