import type { ScopedMutator } from "swr";

// Small wrappers over SWR's `mutate` for the three common list mutations:
// insert / remove / update. Each applies optimistic data immediately, runs the
// server call, then commits (or rolls back on error). Wrap the returned promise
// in `runAction` for loading + toasts. Bespoke shapes (paginated/nested caches,
// e.g. sources & memories) should keep calling `mutate` directly.

const COMMIT = { rollbackOnError: true, revalidate: false } as const;

/** Optimistically prepend `placeholder`, then replace it with the server's created item. */
export function optimisticInsert<T>(
	mutate: ScopedMutator,
	key: string,
	placeholder: T,
	create: () => Promise<T>,
) {
	return mutate<T[]>(
		key,
		async (current) => [await create(), ...(current ?? [])],
		{
			optimisticData: (current) => [placeholder, ...(current ?? [])],
			...COMMIT,
		},
	);
}

/** Optimistically drop items matching `match`, then run the server delete. */
export function optimisticRemove<T>(
	mutate: ScopedMutator,
	key: string,
	match: (item: T) => boolean,
	remove: () => Promise<unknown>,
) {
	const next = (current: T[] | undefined) =>
		(current ?? []).filter((item) => !match(item));
	return mutate<T[]>(
		key,
		async (current) => {
			await remove();
			return next(current);
		},
		{ optimisticData: next, ...COMMIT },
	);
}

/** Optimistically map each item through `patch`, then run the server update. */
export function optimisticUpdate<T>(
	mutate: ScopedMutator,
	key: string,
	patch: (item: T) => T,
	update: () => Promise<unknown>,
) {
	const next = (current: T[] | undefined) => (current ?? []).map(patch);
	return mutate<T[]>(
		key,
		async (current) => {
			await update();
			return next(current);
		},
		{ optimisticData: next, ...COMMIT },
	);
}
