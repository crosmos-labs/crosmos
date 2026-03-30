export enum EntityType {
	PERSON = "person",
	ORGANIZATION = "organization",
	CONCEPT = "concept",
	LOCATION = "location",
	OBJECT = "object",
}

export interface Entity {
	id: number;
	space_id: number;
	name: string;
	entity_type: EntityType | string;
	embedding?: number[];
	meta?: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface Edge {
	id: number;
	space_id: number;
	source_entity_id: number;
	target_entity_id: number;
	relation_type: string;
	memory_id?: number;
	valid_from?: string;
	confidence: number;
	meta?: Record<string, any>;
	recorded_at: string;
	created_at: string;
}

export interface GraphThemeColors {
	bg: string;
	docFill: string;
	docStroke: string;
	docInnerFill: string;
	memFill: string;
	memFillHover: string;
	memStrokeDefault: string;
	accent: string;
	textPrimary: string;
	textSecondary: string;
	textMuted: string;
	edgeDerives: string;
	edgeUpdates: string;
	edgeExtends: string;
	memBorderForgotten: string;
	memBorderExpiring: string;
	memBorderRecent: string;
	glowColor: string;
	iconColor: string;
	popoverBg: string;
	popoverBorder: string;
	popoverTextPrimary: string;
	popoverTextSecondary: string;
	popoverTextMuted: string;
	controlBg: string;
	controlBorder: string;
}

export interface GraphNode extends Entity {
	x?: number;
	y?: number;
	__indexColor?: string;
}

export interface GraphLink extends Edge {
	source: number | GraphNode;
	target: number | GraphNode;
}

export interface GraphData {
	nodes: GraphNode[];
	links: GraphLink[];
}
