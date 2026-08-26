import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { getGraphViewport } from "@/actions/graph";
import { useActiveOrgId } from "@/hooks/use-active-org-id";
import {
	GRAPH_PAGE_SIZE,
	graphPageCount,
	mergeGraphPages,
} from "@/lib/graph/pagination";
import type { GraphViewportResponse } from "@/lib/graph/wire";

type PendingLoadAll = {
	reject: (error: unknown) => void;
	resolve: () => void;
};

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
		isValidating,
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
	const targetPageCount = data ? graphPageCount(data.total_nodes) : 1;
	const hasMore = Boolean(
		data && pages && pages.length < targetPageCount && lastPage?.nodes.length,
	);
	const [isLoadingAll, setIsLoadingAll] = useState(false);
	const loadingAllRef = useRef(false);
	const validationStartedRef = useRef(false);
	const pendingLoadAllRef = useRef<PendingLoadAll | null>(null);

	useEffect(() => {
		if (!isLoadingAll) return;
		if (isValidating) {
			validationStartedRef.current = true;
			return;
		}
		if (!validationStartedRef.current) return;

		const pending = pendingLoadAllRef.current;
		pendingLoadAllRef.current = null;
		validationStartedRef.current = false;
		loadingAllRef.current = false;
		setIsLoadingAll(false);

		if (!pending) return;
		if (error) {
			pending.reject(error);
			return;
		}
		pending.resolve();
	}, [error, isLoadingAll, isValidating]);

	useEffect(() => {
		if (!orgId && !spaceUuid) return;
		return () => {
			pendingLoadAllRef.current?.reject(new Error("Graph load was cancelled"));
			pendingLoadAllRef.current = null;
			validationStartedRef.current = false;
			loadingAllRef.current = false;
			setIsLoadingAll(false);
		};
	}, [orgId, spaceUuid]);

	const loadAll = useCallback(() => {
		if (!data || !hasMore || loadingAllRef.current) return Promise.resolve();
		loadingAllRef.current = true;
		validationStartedRef.current = false;
		setIsLoadingAll(true);

		const promise = new Promise<void>((resolve, reject) => {
			pendingLoadAllRef.current = { reject, resolve };
		});
		void setSize(targetPageCount).catch((requestError: unknown) => {
			const pending = pendingLoadAllRef.current;
			pendingLoadAllRef.current = null;
			validationStartedRef.current = false;
			loadingAllRef.current = false;
			setIsLoadingAll(false);
			pending?.reject(requestError);
		});

		return promise;
	}, [data, hasMore, setSize, targetPageCount]);

	const retry = useCallback(() => mutate(), [mutate]);

	return {
		data,
		hasMore,
		isLoading,
		isValidating,
		isLoadingAll,
		error,
		loadAll,
		retry,
	};
}
