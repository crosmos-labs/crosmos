"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { mutate } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { GetStarted } from "@/components/get-started";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSpaces } from "@/hooks/use-spaces";

function getFirstName(name: string | null | undefined): string {
	if (!name) return "there";
	const trimmed = name.trim();
	if (!trimmed) return "there";
	const first = trimmed.split(/\s+/)[0];
	return first || "there";
}

export default function Home() {
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useCurrentUser();
	const {
		data: spaces,
		isLoading: spacesLoading,
		error: spacesError,
	} = useSpaces();
	const { data: keys, isLoading: keysLoading, error: keysError } = useApiKeys();

	if (userLoading || spacesLoading || keysLoading) {
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

	if (spacesError) {
		return (
			<DataFetchError
				message={spacesError.message}
				onRetry={() => mutate("/spaces")}
			/>
		);
	}

	if (keysError) {
		return (
			<DataFetchError
				message={keysError.message}
				onRetry={() => mutate("/api-keys")}
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
					Your memory engine for AI agents. Get started below.
				</p>
			</div>
			<GetStarted spaces={spaces ?? []} keys={keys ?? []} />
		</div>
	);
}
