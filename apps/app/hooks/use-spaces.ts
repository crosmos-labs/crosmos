import useSWR from "swr";
import { listSpaces } from "@/actions/spaces";
import type { Space } from "@/lib/types/space";

export const spacesKey = "/spaces";

export function useSpaces() {
	return useSWR<Space[]>(spacesKey, () => listSpaces(), {
		keepPreviousData: true,
		revalidateIfStale: false,
		revalidateOnFocus: false,
	});
}
