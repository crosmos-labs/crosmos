"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { GetStarted } from "@/components/get-started";
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
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useCurrentUser();


	if (userLoading) {
		return <AnimatedSpinner name="waverows" size="1.5rem" />;
	}

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
		</div>
	);
}
