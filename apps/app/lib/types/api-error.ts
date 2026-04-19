export type OrgErrorCode =
	| "no_org_context"
	| "slug_taken"
	| "last_owner"
	| "already_member"
	| "invite_exists"
	| "email_mismatch"
	| "cannot_delete_personal_org"
	| "insufficient_role"
	| "api_key_org_mismatch"
	| "invalid_token"
	| "expired"
	| "not_found";

export interface ApiErrorResponse {
	error: OrgErrorCode | string;
	message: string;
}
