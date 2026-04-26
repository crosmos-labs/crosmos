import useSWRImmutable from "swr/immutable";
import {
	getDashboardStatus,
	type DashboardStatus,
} from "@/actions/dashboard";

export function useDashboardStatus() {
	return useSWRImmutable<DashboardStatus>(
		"/dashboard/status",
		() => getDashboardStatus(),
	);
}