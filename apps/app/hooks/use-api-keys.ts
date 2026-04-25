import useSWR from "swr";
import { listApiKeys } from "@/actions/api-keys";
import type { ApiKey } from "@/lib/types/api-key";

export function useApiKeys() {
	return useSWR<ApiKey[]>("/api-keys", () => listApiKeys());
}