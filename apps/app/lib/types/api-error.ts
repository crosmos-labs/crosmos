// Reference of the stable error slugs the backend emits (see docs/rbac-kt.md).
// These are parsed into `ApiError.code` in `lib/api.ts` on the SERVER side. They are
// intentionally NOT branched on in client components: server actions don't serialize
// custom error fields to the client (Next redacts thrown errors to a digest), so the
// UI relies on client-side pre-checks (e.g. last-owner / duplicate-email guards) and
// generic toast messages instead. Kept as the documented server↔client error contract.
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
