import { parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs";
import type { MemoryType, RecallSort } from "@/lib/types/memory";
import type { ContentTypeStr, ExtractionStatus } from "@/lib/types/source";

export const CONTENT_TYPE_VALUES: ContentTypeStr[] = [
	"text",
	"markdown",
	"conversation",
	"pdf",
	"image",
	"audio",
	"video",
	"html",
	"json",
];

export const EXTRACTION_STATUS_VALUES: ExtractionStatus[] = [
	"pending",
	"processing",
	"completed",
	"failed",
];

export const MEMORY_TYPE_VALUES: MemoryType[] = [
	"viewpoint",
	"semantic",
	"episode",
];

export const RECALL_SORT_VALUES: RecallSort[] = ["most", "least"];

export const paginationParsers = {
	page: parseAsInteger.withDefault(1),
	content_type: parseAsStringEnum(CONTENT_TYPE_VALUES),
	extraction_status: parseAsStringEnum(EXTRACTION_STATUS_VALUES),
	space_id: parseAsString,
};

export const memoryPaginationParsers = {
	page: parseAsInteger.withDefault(1),
	memory_type: parseAsStringEnum(MEMORY_TYPE_VALUES),
	recall_sort: parseAsStringEnum(RECALL_SORT_VALUES),
};
