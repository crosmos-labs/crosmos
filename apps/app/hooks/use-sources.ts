import useSWR from "swr";
import { listSources } from "@/actions/sources";
import { SOURCES_PER_PAGE } from "@/lib/params/constants";
import type {
	ContentTypeStr,
	ExtractionStatus,
	SourceSummary,
} from "@/lib/types/source";

export interface SourcesResponse {
	sources: SourceSummary[];
	hasMore: boolean;
	total: number;
}

export interface SourcesFilters {
	content_type: ContentTypeStr | null;
	extraction_status: ExtractionStatus | null;
	space_id: string | null;
}

export function buildSourcesKey(page: number, filters: SourcesFilters): string {
	const params = new URLSearchParams();
	params.set("page", String(page));
	if (filters.content_type) params.set("content_type", filters.content_type);
	if (filters.extraction_status)
		params.set("extraction_status", filters.extraction_status);
	if (filters.space_id) params.set("space_id", filters.space_id);
	return `/sources?${params.toString()}`;
}

export function useSources(page: number = 1, filters: SourcesFilters) {
	const offset = (page - 1) * SOURCES_PER_PAGE;

	return useSWR<SourcesResponse>(
		buildSourcesKey(page, filters),
		() =>
			listSources({
				limit: SOURCES_PER_PAGE,
				offset,
				content_type: filters.content_type,
				extraction_status: filters.extraction_status,
				space_id: filters.space_id,
			}),
		{
			keepPreviousData: true,
			revalidateIfStale: false,
			revalidateOnFocus: false,
		},
	);
}
