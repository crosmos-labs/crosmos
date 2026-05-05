"use client";

import { useQueryStates } from "nuqs";
import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { listSources } from "@/actions/sources";
import { DataFetchError } from "@/components/data-fetch-error";
import { useActionLoader } from "@/components/providers/action-loader-provider";
import { SourceFilters } from "@/components/source-filters";
import { SourceList } from "@/components/source-list";
import { SourceListSkeleton } from "@/components/source-list-skeleton";
import { buildSourcesKey, useSources } from "@/hooks/use-sources";
import { SOURCES_PER_PAGE } from "@/lib/params/constants";
import { paginationParsers } from "@/lib/params/pagination";
import type { ContentTypeStr, ExtractionStatus } from "@/lib/types/source";

export default function SourcesPage() {
	const [queryParams, setQueryParams] = useQueryStates(paginationParsers);
	const page = queryParams.page;
	const contentType = queryParams.content_type as ContentTypeStr | null;
	const extractionStatus =
		queryParams.extraction_status as ExtractionStatus | null;

	const filters = {
		content_type: contentType,
		extraction_status: extractionStatus,
	};

	const {
		data: sourcesData,
		isLoading,
		error: sourcesError,
	} = useSources(page, filters);

	const { cache, mutate } = useSWRConfig();
	const { runAction } = useActionLoader();

	const hasMore = sourcesData?.hasMore ?? false;
	const sources = sourcesData?.sources ?? [];
	const hasFilters = contentType !== null || extractionStatus !== null;
	const swrKey = buildSourcesKey(page, filters);

	const applyQueryChange = useCallback(
		(
			updates: Partial<{
				page: number;
				content_type: ContentTypeStr | null;
				extraction_status: ExtractionStatus | null;
			}>,
		) => {
			const newPage = updates.page ?? 1;
			const newCt =
				updates.content_type !== undefined ? updates.content_type : contentType;
			const newEs =
				updates.extraction_status !== undefined
					? updates.extraction_status
					: extractionStatus;
			const newKey = buildSourcesKey(newPage, {
				content_type: newCt,
				extraction_status: newEs,
			});

			if (cache.get(newKey)?.data !== undefined) {
				setQueryParams(updates);
				return;
			}

			const offset = (newPage - 1) * SOURCES_PER_PAGE;
			runAction(async () => {
				await mutate(
					newKey,
					async () => {
						const data = await listSources({
							limit: SOURCES_PER_PAGE,
							offset,
							content_type: newCt,
							extraction_status: newEs,
						});
						return {
							sources: data.sources,
							hasMore: data.sources.length === SOURCES_PER_PAGE,
							total: data.total,
						};
					},
					{ revalidate: false },
				);
				setQueryParams(updates);
			});
		},
		[contentType, extractionStatus, setQueryParams, cache, mutate, runAction],
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
				onContentTypeChange={(value) =>
					applyQueryChange({ content_type: value, page: 1 })
				}
				onExtractionStatusChange={(value) =>
					applyQueryChange({ extraction_status: value, page: 1 })
				}
			/>
			{isLoading && !sourcesData ? (
				<SourceListSkeleton />
			) : (
				<SourceList
					sources={sources}
					page={page}
					hasMore={hasMore}
					hasFilters={hasFilters}
					swrKey={swrKey}
					onPageChange={(newPage) => applyQueryChange({ page: newPage })}
					onClearFilters={() =>
						applyQueryChange({
							content_type: null,
							extraction_status: null,
							page: 1,
						})
					}
				/>
			)}
		</div>
	);
}
