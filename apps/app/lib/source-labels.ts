import {
	IconBraces,
	IconCode,
	IconFileText,
	IconFileTypePdf,
	IconHeadphones,
	IconMarkdown,
	IconMessageCircle,
	IconPhoto,
	IconVideo,
} from "@tabler/icons-react";
import type {
	ContentTypeStr,
	ExtractionStatus,
	SourceSummary,
} from "@/lib/types/source";

export const CONTENT_TYPE_LABELS: Record<ContentTypeStr, string> = {
	text: "Text",
	markdown: "Markdown",
	conversation: "Conversation",
	pdf: "PDF",
	image: "Image",
	audio: "Audio",
	video: "Video",
	html: "HTML",
	json: "JSON",
};

export const CONTENT_TYPE_ICONS: Record<ContentTypeStr, typeof IconFileText> = {
	text: IconFileText,
	markdown: IconMarkdown,
	conversation: IconMessageCircle,
	pdf: IconFileTypePdf,
	image: IconPhoto,
	audio: IconHeadphones,
	video: IconVideo,
	html: IconCode,
	json: IconBraces,
};

export const EXTRACTION_STATUS_LABELS: Record<ExtractionStatus, string> = {
	pending: "Pending",
	processing: "Extracting",
	completed: "Extracted",
	failed: "Failed",
};

export function sourceTitle(
	source: Pick<SourceSummary, "meta" | "content_type" | "content_preview">,
): string {
	const documentId = source.meta?.document_id;
	if (typeof documentId === "string" && documentId.trim()) {
		return documentId;
	}
	const sessionId = source.meta?.session_id;
	if (
		source.content_type === "conversation" &&
		typeof sessionId === "string" &&
		sessionId.trim()
	) {
		return `Session ${sessionId.slice(0, 8)}`;
	}
	const firstLine = source.content_preview
		.split("\n")
		.map((line) => line.trim())
		.find(Boolean);
	return firstLine ?? "Untitled source";
}

export function sourceErrorMessage(meta: SourceSummary["meta"]): string | null {
	const message = meta?.error_message;
	return typeof message === "string" && message ? message : null;
}
