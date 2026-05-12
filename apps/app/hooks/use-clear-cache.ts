import { mutate } from "swr";

export function clearCache() {
	return mutate(() => true, undefined, { revalidate: false });
}
