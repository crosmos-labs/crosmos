import useSWR from "swr";
import { listApiKeys } from "@/actions/api-keys";
import type { ApiKey } from "@/lib/types/api-key";

export const apiKeysKey = "/api-keys";

export function useApiKeys() {
	return useSWR<ApiKey[]>(apiKeysKey, () => listApiKeys(), {
		keepPreviousData: true,
		revalidateIfStale: false,
		revalidateOnFocus: false,
	});
}
