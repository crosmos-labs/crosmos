import { parseAsInteger, parseAsStringEnum } from "nuqs";
import type { ContentTypeStr, ExtractionStatus } from "@/lib/types/source";

export const CONTENT_TYPE_VALUES: ContentTypeStr[] = [
	"text",
	"markdown",
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

export const paginationParsers = {
	page: parseAsInteger.withDefault(1),
	content_type: parseAsStringEnum(CONTENT_TYPE_VALUES),
	extraction_status: parseAsStringEnum(EXTRACTION_STATUS_VALUES),
};
