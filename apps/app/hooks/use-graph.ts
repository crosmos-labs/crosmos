import { useCallback, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { getGraphViewport } from "@/actions/graph";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import {
	GRAPH_PAGE_SIZE,
	hasMoreGraphPages,
	mergeGraphPages,
} from "@/lib/graph/pagination";
import type { GraphViewportResponse } from "@/lib/graph/wire";

export function graphPrefix(orgId: string): string {
	return `/orgs/${orgId}/graph`;
}

export function graphPageKey(
	orgId: string,
	spaceUuid: string,
	offset: number,
): string {
	const params = new URLSearchParams({
		space_uuid: spaceUuid,
		limit: String(GRAPH_PAGE_SIZE),
		offset: String(offset),
	});
	return `${graphPrefix(orgId)}?${params.toString()}`;
}

export function useGraph(spaceUuid: string | null) {
	const orgId = useActiveOrgId();
	const getKey = useCallback(
		(
			pageIndex: number,
			previousPageData: GraphViewportResponse | null,
		): string | null => {
			if (!orgId || !spaceUuid) return null;
			if (pageIndex > 0 && previousPageData?.nodes.length === 0) return null;
			return graphPageKey(orgId, spaceUuid, pageIndex * GRAPH_PAGE_SIZE);
		},
		[orgId, spaceUuid],
	);
	const fetchPage = useCallback(async (key: string) => {
		const query = key.slice(key.indexOf("?") + 1);
		const params = new URLSearchParams(query);
		const pageSpaceUuid = params.get("space_uuid");
		const limit = Number(params.get("limit"));
		const offset = Number(params.get("offset"));

		if (
			!pageSpaceUuid ||
			!Number.isInteger(limit) ||
			!Number.isInteger(offset) ||
			limit <= 0 ||
			offset < 0
		) {
			throw new Error("Invalid graph page key");
		}

		return getGraphViewport(pageSpaceUuid, { limit, offset });
	}, []);
	const {
		data: pages,
		error,
		isLoading,
		setSize,
		mutate,
	} = useSWRInfinite<GraphViewportResponse>(getKey, fetchPage, {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateFirstPage: false,
		parallel: false,
	});

	const data = useMemo(
		() => (pages ? mergeGraphPages(pages) : undefined),
		[pages],
	);
	const lastPage = pages?.[pages.length - 1];
	const hasMore = Boolean(data && hasMoreGraphPages(data, lastPage));
	const loadingAllRef = useRef(false);

	const loadAll = useCallback(async () => {
		if (!pages || loadingAllRef.current) return;
		loadingAllRef.current = true;

		try {
			let currentPages = pages;
			let requestedSize = currentPages.length;

			while (
				hasMoreGraphPages(
					mergeGraphPages(currentPages),
					currentPages[currentPages.length - 1],
				)
			) {
				requestedSize = Math.max(requestedSize, currentPages.length + 1);
				currentPages = (await setSize(requestedSize)) ?? currentPages;
			}
		} finally {
			loadingAllRef.current = false;
		}
	}, [pages, setSize]);

	const retry = useCallback(() => {
		if (!pages) return mutate();
		return setSize(pages.length + 1);
	}, [mutate, pages, setSize]);

	return {
		data,
		hasMore,
		isLoading,
		error,
		loadAll,
		retry,
	};
}
