export interface OrgResponse {
	id: string;
	slug: string;
	name: string;
	plan: "free" | "developer" | "pro" | "enterprise";
	billing_email: string | null;
	created_at: string;
	updated_at: string;
}

export interface OrgDetailResponse extends OrgResponse {
	member_count: number;
	your_role: "owner" | "admin" | "member";
}

export interface ActiveOrgSummary {
	id: string;
	slug: string;
	name: string;
	your_role: "owner" | "admin" | "member";
}

export interface OrgListResponse {
	orgs: OrgDetailResponse[];
	next_cursor: string | null;
}

export interface CreateOrgRequest {
	name: string;
	slug?: string;
}

export interface UpdateOrgRequest {
	name?: string;
	slug?: string;
	billing_email?: string | null;
}

export type OrgRole = "owner" | "admin" | "member";

export interface MemberResponse {
	user_id: string;
	email: string;
	name: string;
	role: OrgRole;
	joined_at: string;
}

export interface MemberListResponse {
	members: MemberResponse[];
	next_cursor: string | null;
}

export interface ChangeRoleRequest {
	role: "admin" | "member";
}

export interface InviteResponse {
	id: string;
	email: string;
	role: "admin" | "member";
	invited_by: string;
	expires_at: string;
	status: "pending" | "expired" | "accepted";
}

export interface InviteListResponse {
	invites: InviteResponse[];
}

export interface CreateInviteRequest {
	email: string;
	role: "admin" | "member";
}

export interface AcceptInviteRequest {
	token: string;
}

export interface AcceptInviteResponse {
	org: OrgResponse;
	role: "admin" | "member";
}

export interface InvitePreviewResponse {
	org_name: string;
	inviter_name: string | null;
	role: "admin" | "member";
	email: string;
	expires_at: string;
}
