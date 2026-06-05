"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { SourceFilters } from "@/components/source-filters";
import { SourceList } from "@/components/source-list";
import { SourceListSkeleton } from "@/components/source-list-skeleton";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import { buildSourcesKey, useSources } from "@/hooks/use-sources";
import { useSpaces } from "@/hooks/use-spaces";
import type { ContentTypeStr, ExtractionStatus } from "@/lib/types/source";

export default function SourcesPage() {
	const orgId = useActiveOrgId();
	const [_page, setPage] = useState(1);
	const [contentType, setContentType] = useState<ContentTypeStr | null>(null);
	const [extractionStatus, setExtractionStatus] =
		useState<ExtractionStatus | null>(null);
	const [spaceId, setSpaceId] = useState<string | null>(null);

	const [queryPage, setQueryPage] = useState(1);
	const [queryCt, setQueryCt] = useState<ContentTypeStr | null>(null);
	const [queryEs, setQueryEs] = useState<ExtractionStatus | null>(null);
	const [querySpace, setQuerySpace] = useState<string | null>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const prevOrgIdRef = useRef<string | null>(null);

	const queryFilters = {
		content_type: queryCt,
		extraction_status: queryEs,
		space_id: querySpace,
	};
	const emptyFilters = {
		content_type: null,
		extraction_status: null,
		space_id: null,
	};
	const queryMatchesOrg =
		!orgId || prevOrgIdRef.current === null || prevOrgIdRef.current === orgId;
	const effectiveQueryPage = queryMatchesOrg ? queryPage : 1;
	const effectiveQueryFilters = queryMatchesOrg ? queryFilters : emptyFilters;

	const {
		data: sourcesData,
		isLoading,
		isValidating,
		error: sourcesError,
	} = useSources(effectiveQueryPage, effectiveQueryFilters);

	const { data: spacesData, isLoading: spacesLoading } = useSpaces();

	const { cache, mutate } = useSWRConfig();

	const hasMore = sourcesData?.hasMore ?? false;
	const sources = sourcesData?.sources ?? [];
	const hasFilters =
		contentType !== null || extractionStatus !== null || spaceId !== null;
	const swrKey = orgId
		? buildSourcesKey(orgId, effectiveQueryPage, effectiveQueryFilters)
		: null;

	const spaceNameLookup = useMemo(() => {
		const map = new Map<string, string>();
		if (spacesData) {
			for (const space of spacesData) {
				map.set(space.id, space.name);
			}
		}
		return map;
	}, [spacesData]);

	const flushQueryState = useCallback(
		(
			newPage: number,
			newCt: ContentTypeStr | null,
			newEs: ExtractionStatus | null,
			newSpace: string | null,
		) => {
			setQueryPage(newPage);
			setQueryCt(newCt);
			setQueryEs(newEs);
			setQuerySpace(newSpace);
		},
		[],
	);

	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	useEffect(() => {
		if (!orgId) return;
		if (prevOrgIdRef.current === null) {
			prevOrgIdRef.current = orgId;
			return;
		}
		if (prevOrgIdRef.current === orgId) return;

		prevOrgIdRef.current = orgId;
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
			debounceRef.current = null;
		}
		setPage(1);
		setContentType(null);
		setExtractionStatus(null);
		setSpaceId(null);
		flushQueryState(1, null, null, null);
	}, [orgId, flushQueryState]);

	const applyChange = useCallback(
		(
			newPage: number,
			newCt: ContentTypeStr | null,
			newEs: ExtractionStatus | null,
			newSpace: string | null,
		) => {
			if (!orgId) return;
			setPage(newPage);
			setContentType(newCt);
			setExtractionStatus(newEs);
			setSpaceId(newSpace);

			const newKey = buildSourcesKey(orgId, newPage, {
				content_type: newCt,
				extraction_status: newEs,
				space_id: newSpace,
			});

			if (cache.get(newKey)?.data !== undefined) {
				if (debounceRef.current) {
					clearTimeout(debounceRef.current);
					debounceRef.current = null;
				}
				flushQueryState(newPage, newCt, newEs, newSpace);
				return;
			}

			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			debounceRef.current = setTimeout(() => {
				flushQueryState(newPage, newCt, newEs, newSpace);
			}, 200);
		},
		[cache, flushQueryState, orgId],
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
					onRetry={() => (swrKey ? mutate(swrKey) : Promise.resolve())}
				/>
			</div>
		);
	}

	const isFetching = !orgId || (isLoading && !sourcesData);
	const isValidatingFilters = isValidating && !!sourcesData;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Sources</h1>
				<p className="text-sm text-muted-foreground">
					All sources ingested across your spaces.
				</p>
			</div>
			{orgId && (
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
						if (debounceRef.current) {
							clearTimeout(debounceRef.current);
							debounceRef.current = null;
						}
						setPage(1);
						setContentType(null);
						setExtractionStatus(null);
						setSpaceId(null);
						flushQueryState(1, null, null, null);
					}}
				/>
			)}
			{isFetching || isValidatingFilters ? (
				<SourceListSkeleton />
			) : swrKey ? (
				<SourceList
					sources={sources}
					page={effectiveQueryPage}
					hasMore={hasMore}
					hasFilters={hasFilters}
					swrKey={swrKey}
					spaceNameLookup={spaceNameLookup}
					onPageChange={(newPage) =>
						applyChange(newPage, contentType, extractionStatus, spaceId)
					}
					onClearFilters={() => {
						if (debounceRef.current) {
							clearTimeout(debounceRef.current);
							debounceRef.current = null;
						}
						setPage(1);
						setContentType(null);
						setExtractionStatus(null);
						setSpaceId(null);
						flushQueryState(1, null, null, null);
					}}
				/>
			) : (
				<SourceListSkeleton />
			)}
		</div>
	);
}
