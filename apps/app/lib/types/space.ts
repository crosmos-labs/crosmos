export interface Space {
	id: string;
	org_id: number;
	name: string;
	description: string | null;
	meta: Record<string, unknown> | null;
	created_at: string;
	updated_at: string;
}

export interface SpaceListResponse {
	spaces: Space[];
	total: number;
}
