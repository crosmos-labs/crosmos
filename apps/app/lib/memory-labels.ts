import {
	IconBook,
	IconCalendarEvent,
	IconEye,
	IconSparkles,
} from "@tabler/icons-react";
import type { ComponentType } from "react";
import type { MemoryType } from "@/lib/types/memory";

export const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
	viewpoint: "Viewpoint",
	semantic: "Semantic",
	episode: "Episode",
	inference: "Inference",
};

export const MEMORY_TYPE_DESCRIPTIONS: Record<MemoryType, string> = {
	viewpoint: "A preference, feeling, opinion, or subjective judgment.",
	semantic: "An ongoing state, identity, or durable fact.",
	episode: "A specific event or transition with temporal context.",
	inference: "A higher-level understanding inferred from related facts.",
};

export const MEMORY_TYPE_ICONS: Record<
	MemoryType,
	ComponentType<{ className?: string }>
> = {
	viewpoint: IconEye,
	semantic: IconBook,
	episode: IconCalendarEvent,
	inference: IconSparkles,
};

export const MEMORY_TYPE_BADGE_VARIANT: Record<
	MemoryType,
	"secondary" | "outline" | "ghost"
> = {
	viewpoint: "secondary",
	semantic: "secondary",
	episode: "secondary",
	inference: "outline",
};
