import useSWR from "swr";
import { listSpaces } from "@/actions/spaces";
import type { Space } from "@/lib/types/space";

export function useSpaces() {
	return useSWR<Space[]>("/spaces", () => listSpaces(), { keepPreviousData: true, revalidateIfStale: false });
}
