export interface AuthUser {
	user_id: string;
	email: string;
	name: string;
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