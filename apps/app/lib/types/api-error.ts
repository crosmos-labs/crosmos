// Stable error slugs the backend emits, mirroring `map_org_error_to_http`.
export type OrgErrorCode =
	| "no_org_context"
	| "not_found"
	| "member_not_found"
	| "last_owner"
	| "slug_taken"
	| "already_member"
	| "cannot_delete_personal_org"
	| "invite_not_found"
	| "invite_expired"
	| "invite_already_accepted"
	| "duplicate_invite"
	| "already_in_org" // reserved; not currently emitted (re-accept returns already_member)
	| "invite_email_mismatch"
	| "insufficient_role"
	| "api_key_org_mismatch"
	| "organization_error";

export interface ApiErrorResponse {
	error: OrgErrorCode | string;
	message: string;
}
