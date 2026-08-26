import type { ScopedMutator } from "swr";
import { unstable_serialize } from "swr/infinite";
import { graphPrefix } from "@/hooks/use-graph";
import { memoriesPrefix } from "@/hooks/use-memories";
import { sourcesPrefix } from "@/hooks/use-sources";

// Clears instead of revalidating: unmounted keys have no bound fetcher, and an
// empty cache forces a refetch on next mount despite revalidateIfStale: false.
// exceptKey skips a mounted key the caller already reconciles (or knows is dead).
export function clearContentCaches(
	mutate: ScopedMutator,
	orgId: string,
	exceptKey?: string,
): Promise<unknown> {
	const prefixes = [
		memoriesPrefix(orgId),
		graphPrefix(orgId),
		sourcesPrefix(orgId),
	];
	const infiniteGraphPrefix = unstable_serialize(() => graphPrefix(orgId));
	return mutate(
		(key) =>
			typeof key === "string" &&
			key !== exceptKey &&
			(prefixes.some((p) => key.startsWith(p)) ||
				key.startsWith(infiniteGraphPrefix)),
		undefined,
		{ revalidate: true },
	).catch(() => {});
}
