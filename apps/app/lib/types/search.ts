export interface SearchResponse {
	query: string;
	candidates: MemoryCandidate[];
}

export interface MemoryCandidate {
	memory_id: number;
	content: string;
	memory_type: string;
	importance_score: number | null;
	created_at: string;
	recorded_at: string;
	event_time: string | null;
	source_chunk: string | null;
	fused_score: number;
	persistence_score: number;
	final_score: number;
	source_signals: string[];
}
