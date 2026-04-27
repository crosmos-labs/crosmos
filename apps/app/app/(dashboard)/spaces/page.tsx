"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { SpaceList } from "@/components/space-list";
import { useSpaces } from "@/hooks/use-spaces";

export default function SpacesPage() {
	const { mutate } = useSWRConfig();
	const { data: spaces, isLoading, error } = useSpaces();

	if (isLoading) {
		return <AnimatedSpinner name="waverows" size="1.5rem" />;
	}

	if (error) {
		return (
			<DataFetchError
				message={error.message}
				onRetry={() => mutate("/spaces")}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
				<p className="text-sm text-muted-foreground">
					Manage your memory spaces for storing and retrieving data.
				</p>
			</div>
			<SpaceList spaces={spaces ?? []} />
		</div>
	);
}
