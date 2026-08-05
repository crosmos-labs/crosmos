"use server";

import { type ActionResult, toActionError } from "@/lib/action-result";
import { apiFetch } from "@/lib/api";
import { SOURCES_PER_PAGE } from "@/lib/params/constants";
import type {
	ContentTypeStr,
	ExtractionStatus,
	Source,
	SourceListResponse,
	SourceSummary,
} from "@/lib/types/source";

export async function listSources(options?: {
	limit?: number;
	offset?: number;
	content_type?: ContentTypeStr | null;
	extraction_status?: ExtractionStatus | null;
	space_id?: string | null;
}): Promise<{ sources: SourceSummary[]; hasMore: boolean; total: number }> {
	const limit = options?.limit ?? SOURCES_PER_PAGE;
	const offset = options?.offset ?? 0;
	const params = new URLSearchParams({
		limit: String(limit),
		offset: String(offset),
	});
	if (options?.content_type) params.set("content_type", options.content_type);
	if (options?.extraction_status)
		params.set("extraction_status", options.extraction_status);
	if (options?.space_id) params.set("space_id", options.space_id);

	const data = await apiFetch<SourceListResponse>(
		`/sources?${params.toString()}`,
	);
	return {
		sources: data.sources,
		hasMore: offset + data.sources.length < data.total,
		total: data.total,
	};
}

export async function getSource(
	sourceUuid: string,
	spaceUuid: string,
): Promise<ActionResult<Source>> {
	try {
		const data = await apiFetch<Source>(
			`/sources/${sourceUuid}?space_uuid=${spaceUuid}`,
		);
		return { ok: true, data };
	} catch (err) {
		return toActionError(err);
	}
}

export async function deleteSource(
	sourceUuid: string,
	spaceUuid: string,
): Promise<void> {
	await apiFetch(`/sources/${sourceUuid}?space_uuid=${spaceUuid}`, {
		method: "DELETE",
	});
}
