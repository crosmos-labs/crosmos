import type { Arguments, ScopedMutator } from "swr";

// One optimistic primitive for every SWR cache shape: apply optimistic data, run
// the server call, roll back on error, then reconcile with a background refetch.

export type ListAdapter<C, T> = {
	read: (cache: C | undefined) => T[];
	write: (cache: C | undefined, next: T[]) => C;
};

export function listIn<C, T>(
	read: (cache: C | undefined) => T[],
	write: (cache: C | undefined, next: T[]) => C,
): ListAdapter<C, T> {
	return { read, write };
}

const flatAdapter: ListAdapter<unknown[], unknown> = {
	read: (cache) => cache ?? [],
	write: (_cache, next) => next,
};

const COMMIT = { rollbackOnError: true, revalidate: false } as const;

type Opts<C, T> = { adapter?: ListAdapter<C, T>; also?: Arguments[] };

// Fire-and-forget revalidate; errors are swallowed so a failed refetch can't
// become an unhandled rejection.
function reconcile(mutate: ScopedMutator, key: Arguments) {
	void mutate(key).catch(() => {});
}

async function settle<C>(
	mutate: ScopedMutator,
	key: Arguments,
	commit: (cache: C | undefined) => Promise<C>,
	optimisticData: (cache: C | undefined) => C,
	also?: Arguments[],
): Promise<void> {
	try {
		await mutate<C>(key, commit, { optimisticData, ...COMMIT });
	} finally {
		reconcile(mutate, key);
		for (const target of also ?? []) reconcile(mutate, target);
	}
}

function adapterOf<C, T>(opts?: Opts<C, T>): ListAdapter<C, T> {
	return opts?.adapter ?? (flatAdapter as unknown as ListAdapter<C, T>);
}

// The optimistic row is `placeholder`; the committed row is the server's item.
export function optimisticInsert<T, C = T[]>(
	mutate: ScopedMutator,
	key: Arguments,
	placeholder: T,
	create: () => Promise<T>,
	opts?: Opts<C, T>,
): Promise<void> {
	const a = adapterOf(opts);
	const apply = (item: T, cache: C | undefined) =>
		a.write(cache, [item, ...a.read(cache)]);
	return settle<C>(
		mutate,
		key,
		async (cache) => apply(await create(), cache),
		(cache) => apply(placeholder, cache),
		opts?.also,
	);
}

export function optimisticRemove<T, C = T[]>(
	mutate: ScopedMutator,
	key: Arguments,
	match: (item: T) => boolean,
	remove: () => Promise<unknown>,
	opts?: Opts<C, T>,
): Promise<void> {
	const a = adapterOf(opts);
	const apply = (cache: C | undefined) =>
		a.write(
			cache,
			a.read(cache).filter((item) => !match(item)),
		);
	return settle<C>(
		mutate,
		key,
		async (cache) => {
			await remove();
			return apply(cache);
		},
		apply,
		opts?.also,
	);
}

export function optimisticUpdate<T, C = T[]>(
	mutate: ScopedMutator,
	key: Arguments,
	patch: (item: T) => T,
	update: () => Promise<unknown>,
	opts?: Opts<C, T>,
): Promise<void> {
	const a = adapterOf(opts);
	const apply = (cache: C | undefined) =>
		a.write(cache, a.read(cache).map(patch));
	return settle<C>(
		mutate,
		key,
		async (cache) => {
			await update();
			return apply(cache);
		},
		apply,
		opts?.also,
	);
}

// Replaces the whole cache value, for non-list caches (single value or batch set).
export function optimisticReplace<C>(
	mutate: ScopedMutator,
	key: Arguments,
	next: C,
	server: () => Promise<unknown>,
	opts?: { also?: Arguments[] },
): Promise<void> {
	return settle<C>(
		mutate,
		key,
		async () => {
			await server();
			return next;
		},
		() => next,
		opts?.also,
	);
}
