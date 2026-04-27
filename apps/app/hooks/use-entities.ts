import useSWR from "swr";
import { listEntities } from "@/actions/entities";
import type { Entity } from "@/lib/types/entity";

export function useEntities(spaceUuid: string) {
	return useSWR<Entity[]>(
		spaceUuid ? `/entities?space_uuid=${spaceUuid}` : null,
		() => listEntities(spaceUuid),
		{
			keepPreviousData: true,
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
