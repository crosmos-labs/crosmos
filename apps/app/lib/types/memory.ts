export type MemoryType = "viewpoint" | "semantic" | "episode" | "inference";

export type RecallSort = "most" | "least";

export interface Memory {
	id: string;
	space_id: string;
	content: string;
	memory_type: MemoryType;
	importance_score: number | null;
	event_time: string | null;
	meta: Record<string, unknown> | null;
	access_frequency: number;
	last_accessed_at: string;
	forgotten_at: string | null;
	created_at: string;
}

export interface MemoryListResponse {
	memories: Memory[];
	count: number;
}
