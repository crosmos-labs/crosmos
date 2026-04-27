export type EntityType =
	| "person"
	| "organization"
	| "technology"
	| "project"
	| "concept"
	| "location"
	| "object";

export interface Entity {
	id: string;
	space_id: string;
	name: string;
	entity_type: EntityType | string | null;
	edge_count: number;
	created_at: string;
	updated_at: string;
}

export interface EntityListResponse {
	entities: Entity[];
	total: number;
}
