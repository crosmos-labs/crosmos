"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BaseEdge, BaseNode } from "../types/public";
import type { GraphDataSource, GraphPage, LoadParams } from "./source";

export interface UseGraphDataResult<
	TNode extends BaseNode,
	TEdge extends BaseEdge,
> {
	data: GraphPage<TNode, TEdge> | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

export function useGraphData<TNode extends BaseNode, TEdge extends BaseEdge>(
	source: GraphDataSource<TNode, TEdge> | null | undefined,
	params?: LoadParams,
): UseGraphDataResult<TNode, TEdge> {
	const [data, setData] = useState<GraphPage<TNode, TEdge> | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);
	const versionRef = useRef(0);

	const limit = params?.limit;
	const offset = params?.offset;
	const cursor = params?.cursor;

	const runLoad = useCallback(() => {
		if (!source) {
			setData(null);
			setIsLoading(false);
			setError(null);
			return undefined;
		}
		const version = ++versionRef.current;
		const controller = new AbortController();
		setIsLoading(true);
		setError(null);
		source
			.load({ limit, offset, cursor, signal: controller.signal })
			.then((page) => {
				if (version !== versionRef.current) return;
				setData(page);
				setIsLoading(false);
			})
			.catch((err: unknown) => {
				if (version !== versionRef.current) return;
				if (err instanceof DOMException && err.name === "AbortError") return;
				setError(err instanceof Error ? err : new Error(String(err)));
				setIsLoading(false);
			});
		return () => controller.abort();
	}, [source, limit, offset, cursor]);

	useEffect(() => {
		const cancel = runLoad();
		return cancel;
	}, [runLoad]);

	useEffect(() => {
		if (!source?.subscribe) return;
		let cancel: (() => void) | undefined;
		const unsubscribe = source.subscribe(() => {
			cancel?.();
			cancel = runLoad();
		});
		return () => {
			unsubscribe();
			cancel?.();
		};
	}, [source, runLoad]);

	const refetch = useCallback(() => {
		runLoad();
	}, [runLoad]);

	return { data, isLoading, error, refetch };
}
