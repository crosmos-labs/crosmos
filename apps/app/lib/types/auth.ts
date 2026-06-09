import type { OrgRole } from "@/lib/types/org";

export interface AuthUser {
	user_id: string;
	email: string;
	name: string;
	active_org_id?: string | null;
}

// Backend `GET /auth/me` shape; mapped to AuthUser via `toAuthUser`.
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

export function toAuthUser(me: MeResponse): AuthUser {
	return {
		user_id: me.user_id,
		email: me.email,
		name: me.name,
		active_org_id: me.org?.id ?? null,
	};
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

// POST /auth/active-org re-mints the access token only; refresh is untouched.
export interface SetActiveOrgResponse {
	access_token: string;
	active_org_id: string;
}
