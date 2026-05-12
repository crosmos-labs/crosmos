"use client";

import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { SpaceList } from "@/components/space-list";
import { SpacesListSkeleton } from "@/components/spaces-list-skeleton";
import { useSpaces } from "@/hooks/use-spaces";

export default function SpacesPage() {
	const { mutate } = useSWRConfig();
	const { data: spaces, isLoading, error } = useSpaces();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">Spaces</h1>
				<p className="text-sm text-muted-foreground">
					Manage your memory spaces for storing and retrieving data.
				</p>
			</div>
			{error ? (
				<DataFetchError
					message={error.message}
					onRetry={() => mutate("/spaces")}
				/>
			) : isLoading && !spaces ? (
				<SpacesListSkeleton />
			) : (
				<SpaceList spaces={spaces ?? []} />
			)}
		</div>
	);
}
