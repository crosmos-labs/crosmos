import useSWRImmutable from "swr/immutable";
import { type DashboardStatus, getDashboardStatus } from "@/actions/dashboard";

export function useDashboardStatus() {
	return useSWRImmutable<DashboardStatus>("/dashboard/status", () =>
		getDashboardStatus(),
	);
}
