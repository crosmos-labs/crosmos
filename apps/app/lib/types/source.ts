export type ContentTypeStr =
	| "text"
	| "markdown"
	| "conversation"
	| "pdf"
	| "image"
	| "audio"
	| "video"
	| "html"
	| "json";

export type ExtractionStatus =
	| "pending"
	| "processing"
	| "completed"
	| "failed";

export interface SourceSummary {
	id: string;
	space_id: string;
	content_type: ContentTypeStr;
	extraction_status: ExtractionStatus;
	meta: Record<string, unknown> | null;
	token_count: number;
	created_at: string;
	updated_at: string;
	content_preview: string;
}

export interface SourceListResponse {
	sources: SourceSummary[];
	count: number;
	total: number;
}
