"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { useQueryStates } from "nuqs";
import { use, useEffect } from "react";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { MemoryList } from "@/components/memory-list";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useMemories } from "@/hooks/use-memories";
import { useSpaces } from "@/hooks/use-spaces";
import { paginationParsers } from "@/lib/params/pagination";

export default function SpaceDetailPage({
	params,
}: {
	params: Promise<{ spaceId: string }>;
}) {
	const { spaceId } = use(params);
	const {
		data: spaces,
		isLoading: spacesLoading,
		error: spacesError,
	} = useSpaces();
	const [queryParams, setQueryParams] = useQueryStates(paginationParsers);
	const page = queryParams.page;
	const {
		data: memoriesData,
		isLoading: memoriesLoading,
		error: memoriesError,
	} = useMemories(spaceId, page);

	const space = spaces?.find((s) => s.id === spaceId);
	const { setBreadcrumb } = useBreadcrumb();
	const { mutate } = useSWRConfig();

	useEffect(() => {
		if (space) {
			setBreadcrumb({
				label: space.name,
				parent: { label: "Spaces", href: "/spaces" },
			});
		}
		return () => setBreadcrumb(null);
	}, [space, setBreadcrumb]);

	useEffect(() => {
		setQueryParams({ page: 1 });
	}, [setQueryParams]);

	const hasMore = memoriesData?.hasMore ?? false;
	const memories = memoriesData?.memories ?? [];

	const isLoading = spacesLoading || memoriesLoading;

	if (isLoading) {
		return <AnimatedSpinner name="waverows" size="1.5rem" />;
	}

	if (spacesError) {
		return (
			<DataFetchError
				message={spacesError.message}
				onRetry={() => mutate("/spaces")}
			/>
		);
	}

	if (memoriesError) {
		return (
			<DataFetchError
				message={memoriesError.message}
				onRetry={() => mutate(`/memories?space_uuid=${spaceId}`)}
			/>
		);
	}

	if (!space) {
		return (
			<DataFetchError
				message="Space not found"
				onRetry={() => mutate("/spaces")}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight">{space.name}</h1>
				<p className="text-sm text-muted-foreground">
					{space.description ?? "No description"}
				</p>
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold tracking-tight">Memories</h2>
				</div>
				<MemoryList
					memories={memories}
					spaceUuid={spaceId}
					page={page}
					hasMore={hasMore}
					onPageChange={(newPage) => setQueryParams({ page: newPage })}
				/>
			</div>
		</div>
	);
}
