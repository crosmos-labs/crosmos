// Backend visibility ("read-access graph") shapes — see docs/rbac-kt.md §6.

export interface VisibilityGroup {
	id: string;
	slug: string;
	name: string;
	member_count: number;
	created_at: string;
	updated_at: string;
}

export interface GroupMember {
	user_id: string;
	email: string;
	name: string;
}

export interface VisibilityGrant {
	id: string;
	viewer_group_id: string;
	viewer_group_slug: string;
	subject_group_id: string;
	subject_group_slug: string;
	created_at: string;
}

export interface VisiblePrincipal {
	user_id: string;
	email: string;
	name: string;
}

export interface VisibilityPreview {
	user_id: string;
	visibility_enabled: boolean;
	visible_users: VisiblePrincipal[];
}

export interface VisibilitySettings {
	visibility_enabled: boolean;
}
