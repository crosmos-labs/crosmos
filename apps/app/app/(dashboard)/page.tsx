"use client";

import { useSWRConfig } from "swr";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { GetStarted } from "@/components/dashboard/get-started";
import { DataFetchError } from "@/components/shared/data-fetch-error";
import { useCurrentUser } from "@/hooks/use-current-user";

function getFirstName(name: string | null | undefined): string {
	if (!name) return "there";
	const trimmed = name.trim();
	if (!trimmed) return "there";
	const first = trimmed.split(/\s+/)[0];
	return first || "there";
}

export default function Home() {
	const { mutate } = useSWRConfig();
	const { data: user, error: userError } = useCurrentUser();

	if (userError) {
		return (
			<DataFetchError
				message={userError.message}
				onRetry={() => mutate("/auth/me")}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					Welcome, {getFirstName(user?.name)}
				</h1>
				<p className="text-sm text-muted-foreground">
					Your memory layer for AI agents. Get started below.
				</p>
			</div>
			<GetStarted />
			<DashboardStats />
		</div>
	);
}
