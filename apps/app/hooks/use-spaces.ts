import useSWR from "swr";
import { listSpaces, type Space } from "@/actions/spaces";

export function useSpaces() {
	return useSWR<Space[]>("spaces", () => listSpaces());
}
