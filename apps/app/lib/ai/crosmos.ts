import "server-only";

import { ApiError, apiFetch } from "@/lib/api";

/** Subset of a Crosmos search candidate we care about. */
export interface SearchCandidate {
	memory_id: string;
	content: string;
	memory_type: string;
	score: number;
	source?: string | null;
	created_at: string;
}

interface SearchResponse {
	query: string;
	candidates: SearchCandidate[];
	total: number;
	took_ms: number;
}

interface IngestResponse {
	job_id: string;
	source_ids?: string[];
	status?: string;
}

/** Error thrown when Crosmos is transiently unavailable (429/503/504). */
export class CrosmosRetryableError extends Error {
	readonly status: number;
	constructor(status: number, message: string) {
		super(message);
		this.name = "CrosmosRetryableError";
		this.status = status;
	}
}

const RETRYABLE_STATUSES = new Set([429, 503, 504]);

function rethrowRetryable(err: unknown): never {
	if (err instanceof ApiError && RETRYABLE_STATUSES.has(err.status)) {
		throw new CrosmosRetryableError(err.status, err.message);
	}
	throw err;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

/**
 * Hybrid search over the user's memory in a space. Blocks on the Crosmos
 * worker result (≤30s; typically 200–800ms). The space is bound by the caller,
 * never by the model.
 */
export async function searchMemory(args: {
	query: string;
	spaceId: string;
	limit?: number;
}): Promise<SearchCandidate[]> {
	try {
		const data = await apiFetch<SearchResponse>("/search", {
			method: "POST",
			body: JSON.stringify({
				query: args.query,
				space_id: args.spaceId,
				limit: clamp(args.limit ?? 6, 1, 50),
				rerank: true,
				graph: true,
				include_source: true,
			}),
		});
		return data.candidates;
	} catch (err) {
		rethrowRetryable(err);
	}
}

/**
 * Deliberately persist a curated, user-stated fact into a space. Crosmos
 * ingestion is async (202 + job id); we return the job id without polling.
 * The space is bound by the caller, never by the model.
 */
export async function saveMemory(args: {
	content: string;
	spaceId: string;
}): Promise<{ jobId: string }> {
	const data = await apiFetch<IngestResponse>("/sources", {
		method: "POST",
		body: JSON.stringify({
			space_id: args.spaceId,
			sources: [{ content: args.content, content_type: "text" }],
		}),
	});
	return { jobId: data.job_id };
}
