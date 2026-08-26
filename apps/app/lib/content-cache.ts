import type { ScopedMutator } from "swr";
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
	return mutate(
		(key) =>
			typeof key === "string" &&
			key !== exceptKey &&
			prefixes.some((p) => key.startsWith(p)),
		undefined,
		{ revalidate: true },
	).catch(() => {});
}
