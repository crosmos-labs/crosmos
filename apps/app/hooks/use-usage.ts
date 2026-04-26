import useSWR from "swr";
import { getUsage } from "@/actions/usage";
import type { Usage } from "@/lib/types/usage";

export function useUsage() {
	return useSWR<Usage>("/usage", () => getUsage(), {
		keepPreviousData: true,
		revalidateIfStale: false,
	});
}
