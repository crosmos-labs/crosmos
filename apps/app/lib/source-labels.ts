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
import { stripRolePrefix } from "@/lib/conversation";
import { capitalize } from "@/lib/format";
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

export function contentTypeIcon(type: string): typeof IconFileText {
	return CONTENT_TYPE_ICONS[type as ContentTypeStr] ?? IconFileText;
}

export function contentTypeLabel(type: string): string {
	return CONTENT_TYPE_LABELS[type as ContentTypeStr] ?? capitalize(type);
}

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
	const firstLine = source.content_preview
		.split("\n")
		.map((line) => line.trim())
		.find(Boolean);
	if (source.content_type === "conversation") {
		const message = firstLine ? stripRolePrefix(firstLine).trim() : "";
		if (message) return message;
		const sessionId = source.meta?.session_id;
		if (typeof sessionId === "string" && sessionId.trim()) {
			return `Session ${sessionId.slice(0, 8)}`;
		}
	}
	return firstLine ?? "Untitled source";
}

function nestedErrorMessage(value: unknown): string | null {
	if (!value || typeof value !== "object") return null;
	const record = value as Record<string, unknown>;
	if (typeof record.message === "string" && record.message) {
		return record.message;
	}
	for (const nested of Object.values(record)) {
		const found = nestedErrorMessage(nested);
		if (found) return found;
	}
	return null;
}

export function sourceErrorMessage(meta: SourceSummary["meta"]): string | null {
	const message = meta?.error_message;
	if (typeof message !== "string" || !message) return null;
	const jsonStart = message.indexOf("{");
	if (jsonStart === -1) return message;
	try {
		const inner = nestedErrorMessage(JSON.parse(message.slice(jsonStart)));
		if (inner) {
			const prefix = message.slice(0, jsonStart).trim().replace(/:$/, "");
			return prefix ? `${prefix}: ${inner}` : inner;
		}
	} catch {}
	return message;
}
