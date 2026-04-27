"use client";

import { AnimatedSpinner } from "@crosmos/ui/components/animated-spinner";
import { use, useEffect } from "react";
import { useSWRConfig } from "swr";
import { DataFetchError } from "@/components/data-fetch-error";
import { EntityGrid } from "@/components/entity-grid";
import { MemoryList } from "@/components/memory-list";
import { useBreadcrumb } from "@/components/providers/breadcrumb-provider";
import { useEntities } from "@/hooks/use-entities";
import { useMemories } from "@/hooks/use-memories";
import { useSpaces } from "@/hooks/use-spaces";

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
	const {
		data: memories,
		isLoading: memoriesLoading,
		error: memoriesError,
	} = useMemories(spaceId);
	const {
		data: entities,
		isLoading: entitiesLoading,
		error: entitiesError,
	} = useEntities(spaceId);

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

	const isLoading = spacesLoading || memoriesLoading || entitiesLoading;

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

	if (entitiesError) {
		return (
			<DataFetchError
				message={entitiesError.message}
				onRetry={() => mutate(`/entities?space_uuid=${spaceId}`)}
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
					<span className="text-sm text-muted-foreground">
						{memories?.length ?? 0} memor
						{(memories?.length ?? 0) !== 1 ? "ies" : "y"}
					</span>
				</div>
				<MemoryList memories={memories ?? []} spaceUuid={spaceId} />
			</div>
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold tracking-tight">Entities</h2>
					<span className="text-sm text-muted-foreground">
						{entities?.length ?? 0} entit
						{(entities?.length ?? 0) !== 1 ? "ies" : "y"}
					</span>
				</div>
				<EntityGrid entities={entities ?? []} />
			</div>
		</div>
	);
}
