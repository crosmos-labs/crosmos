"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { listSources } from "@/actions/sources";
import { DataFetchError } from "@/components/data-fetch-error";
import { SourceFilters } from "@/components/source-filters";
import { SourceList } from "@/components/source-list";
import { SourceListSkeleton } from "@/components/source-list-skeleton";
import { buildSourcesKey, useSources } from "@/hooks/use-sources";
import { useSpaces } from "@/hooks/use-spaces";
import { SOURCES_PER_PAGE } from "@/lib/params/constants";
import type { ContentTypeStr, ExtractionStatus } from "@/lib/types/source";

export default function SourcesPage() {
	const [page, setPage] = useState(1);
	const [contentType, setContentType] = useState<ContentTypeStr | null>(null);
	const [extractionStatus, setExtractionStatus] =
		useState<ExtractionStatus | null>(null);
	const [spaceId, setSpaceId] = useState<string | null>(null);
	const [isFetchingFilters, setIsFetchingFilters] = useState(false);

	const filters = {
		content_type: contentType,
		extraction_status: extractionStatus,
		space_id: spaceId,
	};

	const {
		data: sourcesData,
		isLoading,
		error: sourcesError,
	} = useSources(page, filters);

	const { data: spacesData, isLoading: spacesLoading } = useSpaces();

	const { cache, mutate } = useSWRConfig();
	const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const hasMore = sourcesData?.hasMore ?? false;
	const sources = sourcesData?.sources ?? [];
	const hasFilters =
		contentType !== null || extractionStatus !== null || spaceId !== null;
	const swrKey = buildSourcesKey(page, filters);

	const spaceNameLookup = useMemo(() => {
		const map = new Map<string, string>();
		if (spacesData) {
			for (const space of spacesData) {
				map.set(space.id, space.name);
			}
		}
		return map;
	}, [spacesData]);

	const applyChange = useCallback(
		(
			newPage: number,
			newCt: ContentTypeStr | null,
			newEs: ExtractionStatus | null,
			newSpace: string | null,
		) => {
			setPage(newPage);
			setContentType(newCt);
			setExtractionStatus(newEs);
			setSpaceId(newSpace);

			const newKey = buildSourcesKey(newPage, {
				content_type: newCt,
				extraction_status: newEs,
				space_id: newSpace,
			});

			if (cache.get(newKey)?.data !== undefined) {
				setIsFetchingFilters(false);
				return;
			}

			setIsFetchingFilters(true);

			if (fetchTimerRef.current) {
				clearTimeout(fetchTimerRef.current);
			}

			fetchTimerRef.current = setTimeout(async () => {
				const offset = (newPage - 1) * SOURCES_PER_PAGE;
				await mutate(
					newKey,
					async () => {
						const data = await listSources({
							limit: SOURCES_PER_PAGE,
							offset,
							content_type: newCt,
							extraction_status: newEs,
							space_id: newSpace,
						});
						return {
							sources: data.sources,
							hasMore: offset + data.sources.length < data.total,
							total: data.total,
						};
					},
					{ revalidate: false },
				);
				setIsFetchingFilters(false);
			}, 200);
		},
		[cache, mutate],
	);

	if (sourcesError) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
					<p className="text-sm text-muted-foreground">
						All sources ingested across your spaces.
					</p>
				</div>
				<DataFetchError
					message={sourcesError.message}
					onRetry={() => mutate(swrKey)}
				/>
			</div>
		);
	}

	const showSkeleton = (isLoading && !sourcesData) || isFetchingFilters;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
				<p className="text-sm text-muted-foreground">
					All sources ingested across your spaces.
				</p>
			</div>
			<SourceFilters
				contentType={contentType}
				extractionStatus={extractionStatus}
				spaceId={spaceId}
				spaces={spacesData ?? []}
				spacesLoading={spacesLoading}
				onContentTypeChange={(value) =>
					applyChange(1, value, extractionStatus, spaceId)
				}
				onExtractionStatusChange={(value) =>
					applyChange(1, contentType, value, spaceId)
				}
				onSpaceChange={(value) =>
					applyChange(1, contentType, extractionStatus, value)
				}
				onClearFilters={() => {
					if (fetchTimerRef.current) {
						clearTimeout(fetchTimerRef.current);
						fetchTimerRef.current = null;
					}
					applyChange(1, null, null, null);
				}}
			/>
			{showSkeleton ? (
				<SourceListSkeleton />
			) : (
				<SourceList
					sources={sources}
					page={page}
					hasMore={hasMore}
					hasFilters={hasFilters}
					swrKey={swrKey}
					spaceNameLookup={spaceNameLookup}
					onPageChange={(newPage) =>
						applyChange(newPage, contentType, extractionStatus, spaceId)
					}
					onClearFilters={() => applyChange(1, null, null, null)}
				/>
			)}
		</div>
	);
}
