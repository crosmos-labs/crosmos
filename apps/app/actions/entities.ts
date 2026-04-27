"use server";

import { apiFetch } from "@/lib/api";
import type { Entity, EntityListResponse } from "@/lib/types/entity";

export async function listEntities(spaceUuid: string): Promise<Entity[]> {
	const data = await apiFetch<EntityListResponse>(
		`/entities?space_uuid=${spaceUuid}&sort_by=name&order=asc&limit=200`,
	);
	return data.entities;
}
