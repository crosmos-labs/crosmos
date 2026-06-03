import type { OrgRole } from "@/lib/types/org";

export interface AuthUser {
	user_id: string;
	email: string;
	name: string;
	active_org_id?: string | null;
}

// Backend `GET /auth/me` shape; mapped to AuthUser in `getCurrentUser`.
export interface MeResponse {
	user_id: string;
	email: string;
	name: string;
	org: {
		id: string;
		slug: string;
		name: string;
		role: OrgRole;
	} | null;
}

export interface TokenResponse {
	access_token: string;
	refresh_token: string;
	user_id: string;
	email: string;
	name: string;
	token_type: string;
	active_org_id?: string | null;
}

export interface OAuthCallbackResponse extends TokenResponse {
	is_new_user: boolean;
	default_space_id: string | null;
}
